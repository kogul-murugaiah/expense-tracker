/*
 * Footer Component
 * Copyright (c) 2026 kogulmurugaiah
 * All rights reserved.
 * 
 * Developer: kogulmurugaiah
 * Description: Footer component with copyright information
 */

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs text-slate-500">
            © 2026 kogulmurugaiah
          </p>
          <p className="text-xs text-slate-600">
            Expense Tracker App
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
