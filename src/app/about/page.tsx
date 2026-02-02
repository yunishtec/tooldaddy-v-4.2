'use client';
import './styles.css';
import { useState, useEffect } from 'react';
import { Amatic_SC, Indie_Flower } from 'next/font/google';
import { cn } from '@/lib/utils';

const amatic = Amatic_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-amatic-sc',
});

const indie = Indie_Flower({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-indie-flower',
});

export default function AboutPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={cn("about-page-container", amatic.variable, indie.variable)}>
      <div className="card">
        {isClient && (
          <>
            <div className="imgBox">
              <div className="bark"></div>
              <div className="logo-container">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 420 420"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M128 341.333C128 304.6 154.6 278 181.333 278H234.667C261.4 278 288 304.6 288 341.333V341.333C288 378.067 261.4 404.667 234.667 404.667H181.333C154.6 404.667 128 378.067 128 341.333V341.333Z" fill="#F87171" />
                  <path d="M288 170.667C288 133.933 314.6 107.333 341.333 107.333H384V404.667H341.333C314.6 404.667 288 378.067 288 341.333V170.667Z" fill="#F87171" />
                  <path d="M150 256C183.5 204 250 204 282 256C314 308 380.5 308 414 256" stroke="white" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="details">
              <div className="page-left">
                <h4 className="color1">Our Team and Story</h4>
                <p>Hey there!</p>
                <p>We're Bucket, Duck, and MrX -</p>
                <p>three teenagers who love</p>
                <p>building cool stuff.</p>
                <p>Tool Daddy is our fun project</p>
                <p>to make life just a little</p>
                <p>bit easier. We hope you</p>
                <p>enjoy using it!</p>
                <p className="text-right">Thanks for stopping by,</p>
                <p className="text-right">♥ The TD Team</p>
              </div>
              <div className="page-right">
                <h4 className="color1">About Tool Daddy</h4>
                <p>This whole project started on</p>
                <p>our Discord server, where we</p>
                <p>hang out as online friends and</p>
                <p>build cool things.</p>
                <p>Tool Daddy is all about:</p>
                <ul>
                  <li>• Being fast, free, and simple.</li>
                  <li>• Running in your browser.</li>
                  <li>• Handling everything from media</li>
                  <li>  to AI without any installs.</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
