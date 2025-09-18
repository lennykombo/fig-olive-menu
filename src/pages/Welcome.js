import { useEffect, useRef } from "react";
import gsap from "gsap";
import cover from '../assets/figandolive.jpg'
import logo from '../assets/figlogo.png'

const Welcome = ({ categories, onSelect }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();

    gsap.fromTo(
      "#spiral-path",
      { strokeDasharray: 1000, strokeDashoffset: 1000 },
      { strokeDashoffset: 0, duration: 3, ease: "power2.inOut" }
    );

    tl.fromTo(
      containerRef.current.querySelectorAll(".category"),
      { y: -400, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "bounce.out", stagger: 0.05 }
    );
  }, [categories]);

  return (
    
    <div ref={containerRef} className="welcome relative min-h-screen flex flex-col items-center text-center">
  {/* Background image + overlay */}
  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${cover})` }} />
  <div className="absolute inset-0 bg-black/60" />

  {/* Spiral SVG */}
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      id="spiral-path"
      d="M250 250 m-200,0 a200,200 0 1,1 400,0 a200,200 0 1,1 -400,0 m50,0 a150,150 0 1,1 300,0 a150,150 0 1,1 -300,0 m50,0 a100,100 0 1,1 200,0 a100,100 0 1,1 -200,0"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="2"
    />
  </svg>

  {/* Logo at the top */}
  <div className="relative z-10 flex justify-center py-6 bg-white rounded-lg w-40">
    <img src={logo} alt="Logo" className="w-40 h-auto drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
  </div>

  {/* Content: Menu title + categories */}
  <div className="relative z-10 flex flex-col items-center justify-center flex-1">
    <h1 className="text-4xl font-bold text-white mb-10 drop-shadow-lg">Menu</h1>

    <div className="flex flex-wrap gap-4 justify-center">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className="category px-6 py-3 rounded-xl bg-white/80 backdrop-blur-md shadow-md text-olive font-semibold hover:bg-olive hover:text-white transition"
          onClick={() => onSelect(cat.id)} // send ID
        >
          {cat.name}
        </button>
      ))}
    </div>
  </div>
</div>

  )
}

export default Welcome;

