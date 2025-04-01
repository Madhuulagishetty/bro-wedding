import { useState, useEffect, useRef } from 'react';

export default function ParallaxScroll() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(true);
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const audioRef = useRef(null);
  const propertyImageRef = useRef(null);
  const propertyTextRef = useRef(null);
  const galleryRef = useRef(null);
  const marqueeRef = useRef(null);
  
  // Improved autoplay when window loads
  useEffect(() => {
    const handleWindowLoad = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            console.log("Autoplay successful on window load!");
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch(error => {
            console.log("Autoplay on window load failed:", error);
            document.addEventListener('click', playAudioOnInteraction, { once: true });
            document.addEventListener('touchstart', playAudioOnInteraction, { once: true });
            document.addEventListener('scroll', playAudioOnInteraction, { once: true });
          });
      }
    };
    
    const playAudioOnInteraction = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            console.log("Audio played after user interaction");
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch(error => {
            console.error("Audio playback failed after interaction:", error);
            setIsPlaying(false);
          });
      }
      
      document.removeEventListener('click', playAudioOnInteraction);
      document.removeEventListener('touchstart', playAudioOnInteraction);
      document.removeEventListener('scroll', playAudioOnInteraction);
    };
    
    window.addEventListener('load', handleWindowLoad);
    
    if (document.readyState === 'complete') {
      handleWindowLoad();
    }
    
    return () => {
      window.removeEventListener('load', handleWindowLoad);
      document.removeEventListener('click', playAudioOnInteraction);
      document.removeEventListener('touchstart', playAudioOnInteraction);
      document.removeEventListener('scroll', playAudioOnInteraction);
    };
  }, []);

  // Effect to handle audio playback based on user interaction
  useEffect(() => {
    if (hasInteracted && isPlaying && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error("Audio playback failed:", error);
        setIsPlaying(false);
      });
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [hasInteracted, isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Audio playback failed:", error);
        });
      }
      setIsPlaying(!isPlaying);
      setHasInteracted(true);
    }
  };
  
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Import GSAP and ScrollTrigger dynamically
    const loadGSAP = async () => {
      try {
        const gsapModule = await import('gsap');
        const scrollTriggerModule = await import('gsap/ScrollTrigger');
        const scrollToPluginModule = await import('gsap/ScrollToPlugin');
        
        const gsap = gsapModule.default;
        const ScrollTrigger = scrollTriggerModule.default;
        const ScrollToPlugin = scrollToPluginModule.default;
        
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
        gsap.defaults({ease: "power2.inOut"});
        
        gsap.to(textRef.current, {
          y: 100,
          opacity: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top top",
            end: "bottom center",
            scrub: 1
          }
        });
        
        if (propertyImageRef.current && propertyTextRef.current) {
          gsap.from(propertyImageRef.current, {
            x: -100,
            opacity: 0,
            duration: 1.5,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: propertyImageRef.current,
              start: "top bottom-=100",
              end: "top center+=100",
              scrub: 1,
              toggleActions: "play none none reverse"
            }
          });
          
          gsap.from(propertyTextRef.current, {
            x: 100,
            opacity: 0,
            duration: 1.5,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: propertyTextRef.current,
              start: "top bottom-=100",
              end: "top center+=100",
              scrub: 1,
              toggleActions: "play none none reverse"
            }
          });
        }
        
        if (galleryRef.current) {
          const galleryItems = galleryRef.current.querySelectorAll('.gallery-item');
          
          galleryItems.forEach((item, index) => {
            gsap.from(item, {
              y: 50,
              opacity: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: item,
                start: "top bottom-=50",
                end: "top center+=100",
                toggleActions: "play none none reverse"
              },
              delay: index * 0.2
            });
          });
        }
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
              gsap.to(window, {
                duration: 1.5,
                scrollTo: { y: target, offsetY: 50 },
                ease: "power4.inOut"
              });
            }
          });
        });
        
        const scrollTopBtn = document.querySelector('.scroll-top-btn');
        if (scrollTopBtn) {
          scrollTopBtn.addEventListener('click', () => {
            gsap.to(window, {
              duration: 1.5,
              scrollTo: { y: 0 },
              ease: "power4.inOut"
            });
          });
        }
        
      } catch (error) {
        console.error("Failed to load GSAP or ScrollTrigger:", error);
      }
    };
    
    loadGSAP();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      
      const cleanupScrollTrigger = async () => {
        try {
          const scrollTriggerModule = await import('gsap/ScrollTrigger');
          const ScrollTrigger = scrollTriggerModule.default;
          ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        } catch (error) {
          console.error("Failed to cleanup ScrollTrigger:", error);
        }
      };
      
      cleanupScrollTrigger();
    };
  }, []);

  // Calculate values based on scroll with improved smoothness
  const backgroundOpacity = Math.max(0, Math.min(1, 1 - scrollPosition / 600));
  const textTop = scrollPosition > 300 ? '10%' : `${50 - (scrollPosition / 12)}%`;
  const textScale = scrollPosition > 300 ? 0.8 : 1 - (scrollPosition / 1800);
  const parallax1 = `${-scrollPosition * 0.25}px`;
  const parallax2 = `${-scrollPosition * 0.12}px`;
  const zoom1 = 1 + (scrollPosition * 0.0006);
  const zoom2 = 1 + (scrollPosition * 0.0003);
  
  // Images for the marquee (using placeholders for display purposes)
  const images = [
    "/Bg-img-01.jpg",
    "/logo192.png", 
    "/logo512.png",
    "/Bg-img-01.jpg",
    "/logo192.png",
    "/logo512.png",
    "/Bg-img-01.jpg"
  ];
  
  // Gallery images
  const galleryImages = [
    {
      src: "/Bg-img-01.jpg",
      alt: "Ceremony Venue",
      title: "The Ceremony",
      description: "Join us for our sacred vows at the Grand Cathedral on May 15th at 10:00 AM."
    },
    {
      src: "/Bg-img-02.jpg",
      alt: "Reception Venue",
      title: "The Reception",
      description: "Celebrate with us at the Royal Garden from 6:00 PM onwards with dinner and dancing."
    },
  ];
  
  return (
    <div className="relative w-full" ref={containerRef}>
      
      {/* Audio Element with preload */}
      <audio ref={audioRef} loop preload="auto">
        <source src="/Music-marriage.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      {/* Sound Control Button */}
      <button 
        onClick={togglePlay}
        className="fixed bottom-4 right-4 z-50 bg-white bg-opacity-30 hover:bg-opacity-60 text-white rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110"
      >
        {isPlaying ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Scroll to top button */}
      <button 
        className="scroll-top-btn fixed bottom-4 left-4 z-50 bg-white bg-opacity-30 hover:bg-opacity-60 text-white rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110"
        style={{ opacity: scrollPosition > 500 ? 1 : 0, pointerEvents: scrollPosition > 500 ? 'auto' : 'none' }}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* First container */}
      <div className="h-screen relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out"
          style={{ 
            backgroundImage: "url('/Bg-img-01.jpg')", 
            transform: `translateY(${parallax1}) scale(${zoom1})`,
            transformOrigin: 'center center',
            filter: 'brightness(0.9)'
          }}
        >
          <div className="absolute inset-0 bg-black" style={{ opacity: backgroundOpacity * 0.3 }}></div>
        </div>
        
        <div 
          ref={textRef}
          className="absolute z-10 w-full text-center transition-all duration-500 ease-out px-4"
          style={{ 
            top: textTop,
            transform: `scale(${textScale})`,
            opacity: scrollPosition > 800 ? 0 : 1
          }}
        >
          <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
            Bharath Weds Ruchitha
          </h1>
          <p className="text-xl text-white opacity-90">Scroll to explore our journey</p>
          
          <div className="mt-8 animate-bounce">
            <svg className="w-8 h-8 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Second container */}
      <div className="h-screen relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out"
          style={{ 
            backgroundImage: "url('/Bg-img-01.jpg')", 
            transform: `translateY(${parallax2}) scale(${zoom2})`,
            transformOrigin: 'center center',
            filter: 'brightness(0.9)'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
          <div 
            className="text-center transform transition-all duration-700 ease-out"
            style={{ 
              opacity: Math.min(1, Math.max(0, (scrollPosition - 300) / 400)),
              transform: `translateY(${Math.min(0, 100 - (scrollPosition - 300) / 4)}px)`
            }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">Our Story</h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Vivamus lacinia odio vitae vestibulum vestibulum.
            </p>
            <button className="mt-8 bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105">
              View Gallery
            </button>
          </div>
        </div>
      </div>
      
      {/* Third container with FIXED Marquee animation */}
      <div className="h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-80"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <h2 
            className="text-5xl font-bold text-white mb-12 text-center"
            style={{ 
              opacity: Math.min(1, Math.max(0, (scrollPosition - 1000) / 400)),
              transform: `translateY(${Math.min(0, 50 - (scrollPosition - 1000) / 8)}px)`
            }}
          >
            Our Moments Together
          </h2>
          
          {/* FIXED Marquee Animation */}
          <div 
            className="w-full overflow-hidden"
            style={{ 
              opacity: Math.min(1, Math.max(0, (scrollPosition - 1100) / 400))
            }}
            ref={marqueeRef}
          >
            {/* Use a real div with CSS animation instead of inline style */}
            <div className="marquee-track flex">
              {/* First set of images */}
              {images.map((img, index) => (
                <div 
                  key={`img-1-${index}`} 
                  className="marquee-item flex-shrink-0 mx-4 transform hover:scale-105"
                >
                  <img 
                    src={img || `/api/placeholder/400/300`}
                    alt={`Wedding moment ${index + 1}`} 
                    className="md:h-64 md:w-64 w-48 h-48 object-cover rounded-lg shadow-lg"
                  />
                </div>
              ))}
              
              {/* Duplicate set for seamless looping */}
              {images.map((img, index) => (
                <div 
                  key={`img-2-${index}`} 
                  className="marquee-item flex-shrink-0 mx-4 transform hover:scale-105"
                >
                  <img 
                    src={img || `/api/placeholder/400/300`}
                    alt={`Wedding celebration ${index + 8}`} 
                    className="md:h-64 md:w-64 w-48 h-48 object-cover rounded-lg shadow-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed header that appears when scrolling */}
      <div 
        className="fixed top-0 left-0 w-full bg-black bg-opacity-80 z-50 py-4 px-4 transition-all duration-500"
        style={{ 
          opacity: Math.min(1, scrollPosition / 300),
          transform: `translateY(${scrollPosition < 300 ? '-100%' : '0'})`
        }}
      >
        <h3 className="text-2xl font-semibold text-white text-center">
          Bharath & Ruchitha
        </h3>
      </div>
      
      {/* Gallery Section */}
      <div 
        ref={galleryRef}
        className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-20"
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-white mb-12 text-center">Join Us On Our Special Day</h2>
          
          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {galleryImages.map((image, index) => (
              <div 
                key={`gallery-item-${index}`}
                className="gallery-item relative overflow-hidden rounded-xl shadow-2xl group transition-all duration-700"
                style={{ height: '600px' }}
              >
                {/* Background image with parallax effect */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-1000 group-hover:scale-110 transform"
                  style={{ 
                    backgroundImage: `url(${image.src || `/api/placeholder/400/300`})`,
                  }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
                </div>
                
                {/* Animated border on hover */}
                <div className="absolute inset-0 border-2 border-pink-500 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-500"></div>
               
                {/* Reveal corner */}
                <div className="absolute top-0 left-0 border-t-2 border-l-2 border-pink-500 w-12 h-12 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-full -translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 delay-200"></div>
                <div className="absolute bottom-0 right-0 border-b-2 border-r-2 border-pink-500 w-12 h-12 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 delay-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CSS for animations and effects - FIXED MARQUEE ANIMATION */}
      <style jsx>{`
        /* FIXED Marquee animation */
        .marquee-track {
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        /* Individual marquee items can float */
        .marquee-item {
          animation: float 8s ease-in-out infinite;
          animation-delay: calc(var(--i, 0) * 0.5s);
        }
        
        .marquee-item:nth-child(2n) {
          animation-delay: 1s;
        }
        
        .marquee-item:nth-child(3n) {
          animation-delay: 2s;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        /* Enable smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        body {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}