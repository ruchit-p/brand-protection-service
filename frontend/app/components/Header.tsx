import Link from 'next/link';

interface HeaderProps {
  activeSection?: 'dashboard' | 'onboarding' | 'home';
}

export default function Header({ activeSection = 'home' }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primary-700">Brand Protection System</h1>
        </Link>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link 
                href="/"
                className={`py-2 ${activeSection === 'home' ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600'}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard"
                className={`py-2 ${activeSection === 'dashboard' ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600'}`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/onboarding"
                className={`px-4 py-2 rounded ${
                  activeSection === 'onboarding' 
                    ? 'bg-primary-700 text-white' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } transition-colors`}
              >
                Get Started
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
