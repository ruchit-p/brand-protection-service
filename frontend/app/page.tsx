import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-700">Brand Protection System</h1>
          
          <div className="space-x-4">
            <Link 
              href="/onboarding"
              className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero */}
      <section className="bg-primary-700 text-white py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-bold mb-6">Protect Your Brand Online</h2>
              <p className="text-lg mb-8">
                Our AI-powered system helps you identify and monitor websites that may be
                impersonating your brand or using your assets without permission.
              </p>
              <Link 
                href="/onboarding"
                className="px-6 py-3 rounded bg-white text-primary-700 font-medium hover:bg-gray-100 transition-colors inline-block"
              >
                Start Brand Protection
              </Link>
            </div>
            
            <div className="md:w-1/2">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <img 
                  src="/brand-protection.svg" 
                  alt="Brand Protection"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3">AI-Guided Onboarding</h3>
              <p className="text-gray-600">
                Our AI assistant helps you provide important information about your brand,
                including your logo, website, and key terms.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3">Advanced Detection</h3>
              <p className="text-gray-600">
                Our system uses AI, image recognition, and code similarity analysis to identify
                potential brand infringements across the web.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3">Dashboard Monitoring</h3>
              <p className="text-gray-600">
                Review flagged websites, see detailed evidence, and take action with
                our intuitive dashboard interface.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Protect Your Brand?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Get started in minutes with our simple onboarding process.
          </p>
          <Link 
            href="/onboarding"
            className="px-8 py-4 rounded bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors inline-block"
          >
            Start Now
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4">Brand Protection System</h3>
              <p className="text-gray-400 max-w-md">
                Protecting brands from online impersonation and unauthorized use with
                AI-powered analysis and monitoring.
              </p>
            </div>
            
            <div className="mt-8 md:mt-0">
              <h4 className="text-lg font-semibold mb-4">Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors">
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Brand Protection System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
