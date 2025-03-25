import os
import json
import uuid
import asyncio
from typing import Dict, List, Any, Optional
import anthropic
from langchain.chains import ConversationChain
from langchain_anthropic import ChatAnthropic
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StructuredOutputParser, ResponseSchema
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

class OnboardingService:
    """
    Service for client onboarding using LangChain and Claude
    """
    
    def __init__(self, db_connection):
        self.db_connection = db_connection
        self.sessions = {}
        
        # Initialize Claude via LangChain
        self.llm = ChatAnthropic(
            model="claude-3-7-sonnet-20250219",
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
            temperature=0.2
        )
        
        # Setup output parser for structured brand data
        self.output_parser = StructuredOutputParser.from_response_schemas([
            ResponseSchema(name="brand_name", description="Name of the brand"),
            ResponseSchema(name="website_url", description="Official website URL"),
            ResponseSchema(name="description", description="Brand description"),
            ResponseSchema(name="social_media", description="List of social media handles as objects with platform and handle"),
            ResponseSchema(name="key_terms", description="List of key brand terms and phrases")
        ])
        
        # Create conversation prompt
        self.prompt = PromptTemplate(
            template="""
            You are a brand protection assistant helping a client set up protection for their brand.
            Collect these details in a conversational way:
            - Brand name
            - Official website URL
            - Brief brand description
            - Social media handles (ask for platforms like Twitter/X, Facebook, Instagram, LinkedIn, etc.)
            - Key brand terms and phrases (including product names, slogans, etc.)
            
            Be friendly and conversational. Once you have collected all the information, let the user know
            that the onboarding is complete and they will proceed to the next step.
            
            {format_instructions}
            
            Previous conversation:
            {chat_history}
            
            Human: {input}
            AI: """,
            input_variables=["chat_history", "input"],
            partial_variables={"format_instructions": self.output_parser.get_format_instructions()}
        )
    
    def start_session(self) -> str:
        """
        Start a new onboarding session
        """
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "conversation": ConversationChain(
                llm=self.llm,
                prompt=self.prompt,
                verbose=True
            ),
            "completed": False,
            "brand_data": {},
            "chat_history": []
        }
        return session_id
    
    async def process_message(self, session_id: str, message: str) -> Dict[str, Any]:
        """
        Process a message in the onboarding conversation
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        
        # If session is already completed, return stored data
        if session["completed"]:
            return {
                "message": "Onboarding is already completed!",
                "completed": True,
                "brand_data": session["brand_data"]
            }
        
        # Add message to chat history
        session["chat_history"].append({"role": "human", "content": message})
        
        # Process with LangChain conversation
        response = await asyncio.to_thread(
            session["conversation"].predict,
            input=message
        )
        
        # Add response to chat history
        session["chat_history"].append({"role": "ai", "content": response})
        
        # Try to parse structured data
        try:
            # Check if the response contains JSON
            if "```json" in response:
                # Extract JSON
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                
                # Parse JSON
                brand_data = json.loads(json_str)
                
                # Check if all required fields are present
                required_fields = ["brand_name", "website_url", "description", "social_media", "key_terms"]
                if all(field in brand_data for field in required_fields):
                    session["completed"] = True
                    session["brand_data"] = brand_data
                    
                    # Store in database
                    self._store_brand_data(brand_data)
                    
                    return {
                        "message": response,
                        "completed": True,
                        "brand_data": brand_data
                    }
        except Exception as e:
            print(f"Error parsing brand data: {e}")
        
        # If not completed, return normal response
        return {
            "message": response,
            "completed": False
        }
    
    def _store_brand_data(self, brand_data: Dict[str, Any]) -> str:
        """
        Store brand data in PostgreSQL
        """
        cursor = self.db_connection.cursor(cursor_factory=RealDictCursor)
        
        try:
            # Insert brand
            cursor.execute(
                """
                INSERT INTO brands (id, name, website_url, description)
                VALUES (uuid_generate_v4(), %s, %s, %s)
                RETURNING id
                """,
                (brand_data["brand_name"], brand_data["website_url"], brand_data["description"])
            )
            
            brand_id = cursor.fetchone()["id"]
            
            # Insert social media
            for social in brand_data["social_media"]:
                cursor.execute(
                    """
                    INSERT INTO brand_social_media (brand_id, platform, handle, url)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (
                        brand_id, 
                        social["platform"], 
                        social["handle"],
                        f"https://{social['platform'].lower()}.com/{social['handle'].replace('@', '')}"
                    )
                )
            
            # Insert keywords
            for keyword in brand_data["key_terms"]:
                cursor.execute(
                    """
                    INSERT INTO brand_keywords (brand_id, keyword)
                    VALUES (%s, %s)
                    """,
                    (brand_id, keyword)
                )
            
            self.db_connection.commit()
            return brand_id
            
        except Exception as e:
            self.db_connection.rollback()
            print(f"Error storing brand data: {e}")
            raise
    
    def get_session_data(self, session_id: str) -> Dict[str, Any]:
        """
        Get data for a session
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        
        return {
            "completed": session["completed"],
            "brand_data": session["brand_data"],
            "chat_history": session["chat_history"]
        }
