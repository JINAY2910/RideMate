import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid gap-12 md:grid-cols-4 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Logo className="h-8 w-8" />
                            <span className="font-bold text-lg tracking-tight">RideMate</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Reimagining daily commutes with community-driven carpooling. Safe, reliable, and eco-friendly.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="text-gray-400 hover:text-black transition-colors"
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-black mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-black transition-colors">How it works</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Safety standards</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Verification</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-black mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-black transition-colors">About us</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Press</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-black mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-black transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Cookie Policy</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Guidelines</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} RideMate Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>Made with</span>
                        <Heart size={12} className="text-red-500 fill-red-500" />
                        <span>for better cities</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
