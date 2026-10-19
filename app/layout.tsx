import type { Metadata, Viewport } from 'next';
import './globals.css';
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#6724d7'};
export const metadata:Metadata={title:'Mahoot — bring everyone into play',description:'Free, open-source live quizzes. Host on the big screen, join on your phone, and make a little friendly competition.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
