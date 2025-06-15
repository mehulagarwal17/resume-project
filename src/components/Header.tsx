
import { Button } from "@/components/ui/button";
import { FileText, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#b2b", label: "For Businesses" },
  { href: "#pricing", label: "Pricing" },
];

const NavLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    className="relative px-5 py-2 rounded-full border border-blue-100 bg-white/60 shadow-sm font-medium text-gray-700 hover:bg-gradient-to-l hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-colors duration-200 story-link focus-visible:ring-2 focus-visible:ring-blue-400"
    style={{
      // cylinder visual for fallback if needed
      boxShadow: "0 1px 4px 0 rgba(41,80,190,0.03)",
    }}
  >
    {label}
  </a>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ResumeAI Pro
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 rounded-full border border-blue-200 px-4 py-2 transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="rounded-full border border-blue-200 text-blue-600 hover:text-blue-700 px-4 py-2"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
                <Button
                  className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-2 shadow-md transition"
                  onClick={() => navigate(user ? '/dashboard' : '/auth')}
                >
                  {user ? "Dashboard" : "Get Started Free"}
                </Button>
              </>
            )}
          </div>

          <button 
            className="md:hidden p-2 rounded-full border border-blue-100 bg-white/70 hover:bg-blue-50 transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Open navigation menu"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col space-y-4 pt-4">
              {navLinks.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} />
              ))}
              {user ? (
                <Button
                  variant="ghost"
                  className="rounded-full border border-blue-200 justify-start px-4 py-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="rounded-full border border-blue-200 text-blue-600 justify-start px-4 py-2"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2"
                    onClick={() => navigate(user ? '/dashboard' : '/auth')}
                  >
                    {user ? "Dashboard" : "Get Started Free"}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
