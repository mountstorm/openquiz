'use client';
import { useEffect,useState } from 'react';
import QRCode from 'qrcode';
export function QrCode({url,label,download=false}:{url:string;label:string;download?:boolean}) {
 const [src,setSrc]=useState(''),[error,setError]=useState(false);
 useEffect(()=>{let live=true;setError(false);setSrc('');QRCode.toDataURL(url,{width:1000,margin:4,errorCorrectionLevel:'M',color:{dark:'#171525',light:'#ffffff'}}).then(s=>{if(live)setSrc(s)}).catch(()=>{if(live)setError(true)});return()=>{live=false;};},[url]);
 return <div className="qr-block">{src?<img src={src} width={220} height={220} alt={label}/>:<p>{error?'QR unavailable. Use the link below.':'Preparing QR…'}</p>}<p>{label}</p>{download&&src&&<a className="small" href={src} download="OpenQuiz-QR.png">Download QR code</a>}</div>;
}
