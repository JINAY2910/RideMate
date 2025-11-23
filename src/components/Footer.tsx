import React from 'react';
import Logo from './Logo';
import { useApp } from '../context/AppContext';

export default function Footer() {
    const { navigateTo } = useApp();

    return (
        <footer className="footer">
            <div className="max-w-7xl mx-auto">
                <div className="footer-grid">
                    <div className="footer-col">
                        <div className="flex items-center gap-2 mb-6">
                            <Logo className="h-8 w-8 bg-white rounded-full text-black p-1" />
                            <span className="font-bold text-lg">RideMate</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Reimagining urban mobility with a focus on safety, efficiency, and community.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4>Platform</h4>
                        <button onClick={() => navigateTo('platform')} className="footer-link">How it Works</button>
                        <button onClick={() => navigateTo('safety')} className="footer-link">Safety Standards</button>
                        <button onClick={() => navigateTo('cities')} className="footer-link">Cities</button>
                        <button onClick={() => navigateTo('vehicles')} className="footer-link">Fleet</button>
                    </div>

                    <div className="footer-col">
                        <h4>Company</h4>
                        <a href="#" className="footer-link">About Us</a>
                        <a href="#" className="footer-link">Careers</a>
                        <a href="#" className="footer-link">Press</a>
                        <a href="#" className="footer-link">Contact</a>
                    </div>

                    <div className="footer-col">
                        <h4>Legal</h4>
                        <a href="#" className="footer-link">Terms of Service</a>
                        <a href="#" className="footer-link">Privacy Policy</a>
                        <a href="#" className="footer-link">Cookie Policy</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} RideMate Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-white transition-colors">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
