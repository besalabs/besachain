"use client"

import { useState } from "react"
import { Menu, X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Mission", href: "#mission" },
  { label: "Governance", href: "#governance" },
  { label: "Grants", href: "#grants" },
  { label: "Research", href: "#research" },
  { label: "Team", href: "#team" },
  { label: "Financials", href: "#financials" },
  { label: "News", href: "#news" },
  { label: "Contact", href: "#contact" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-navy-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-navy-900">Besa Foundation</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-navy-700 hover:text-navy-900 hover:bg-navy-50 rounded-md transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button asChild>
              <a href="https://besachain.com" target="_blank" rel="noopener noreferrer">
                Launch App
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-md text-navy-700 hover:text-navy-900 hover:bg-navy-50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden border-t border-navy-200 bg-white",
          isOpen ? "block" : "hidden"
        )}
      >
        <div className="container mx-auto px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-base font-medium text-navy-700 hover:text-navy-900 hover:bg-navy-50 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="pt-4 border-t border-navy-200">
            <Button className="w-full" asChild>
              <a href="https://besachain.com" target="_blank" rel="noopener noreferrer">
                Launch App
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
