'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">IF</span>
              </div>
              <span className="font-bold text-foreground">InvoiceFlow</span>
            </div>
            <p className="text-sm text-foreground/60">Invoice processing, simplified.</p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Security</Link></li>
              <li><Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Updates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Terms</Link></li>
              <li><Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Compliance</Link></li>
              <li><Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-foreground/60">© 2024 InvoiceFlow. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-7.655 3.74 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.273 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.809 0-9.728h3.554v1.375c.427-.659 1.191-1.595 2.897-1.595 2.117 0 3.704 1.385 3.704 4.362v5.586zM5.337 9.433c-1.144 0-1.915-.758-1.915-1.704 0-.951.768-1.703 1.96-1.703 1.188 0 1.913.752 1.932 1.703 0 .946-.744 1.704-1.977 1.704zm1.582 11.019H3.714V9.724h3.205v10.728zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
