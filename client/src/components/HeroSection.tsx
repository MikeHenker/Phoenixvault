import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import phoenixImage from "@assets/a majestic phoenix r_1760562883267.png";
import { motion, useAnimation } from "framer-motion";

export default function HeroSection() {
  const [hasFlownAway, setHasFlownAway] = useState(false);
  const phoenixControls = useAnimation();

  const handlePhoenixClick = async () => {
    if (hasFlownAway) return;
    
    setHasFlownAway(true);
    
    await phoenixControls.start({
      scale: [1, 1.3, 1.5],
      rotateZ: [0, -10, -15],
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    });
    
    await phoenixControls.start({
      y: -1200,
      x: 300,
      scale: 2,
      rotateZ: -20,
      opacity: 0,
      transition: {
        duration: 2.5,
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    });
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background pointer-events-none" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              background: `hsl(${20 + Math.random() * 30}, 80%, ${60 + Math.random() * 20}%)`,
              boxShadow: `0 0 ${4 + Math.random() * 4}px currentColor`,
            }}
            animate={{
              y: [-20, -800],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 text-center space-y-8 px-4 max-w-6xl mx-auto">
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.5, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="relative cursor-pointer"
            onClick={handlePhoenixClick}
            animate={!hasFlownAway ? {
              y: [0, -20, 0],
            } : {}}
            transition={{
              duration: 3,
              repeat: hasFlownAway ? 0 : Infinity,
              ease: "easeInOut",
            }}
            whileHover={!hasFlownAway ? { scale: 1.1 } : {}}
            whileTap={!hasFlownAway ? { scale: 0.95 } : {}}
          >
            <motion.img
              src={phoenixImage}
              alt="Phoenix - Click to release"
              className="h-40 w-40 md:h-56 md:w-56 drop-shadow-2xl"
              animate={phoenixControls}
              initial={{ scale: 1, rotateZ: 0 }}
            />
            {!hasFlownAway && (
              <>
                <motion.div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-gradient-to-t from-orange-500 to-yellow-400"
                      animate={{
                        y: [0, -30],
                        opacity: [1, 0],
                        scale: [1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </motion.div>
                <motion.div
                  className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  Click to release
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.h1
            className="font-display text-6xl md:text-8xl font-black bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent animate-gradient"
            data-testid="text-hero-title"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% auto",
            }}
          >
            PHOENIX GAMES
          </motion.h1>
        </motion.div>

        <motion.p
          className="text-2xl md:text-3xl text-foreground/90 font-semibold"
          data-testid="text-hero-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Ignite Your Gaming Experience
        </motion.p>

        <motion.p
          className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Discover the ultimate collection of games across all platforms. Download, play, and immerse yourself in endless adventures with our multi-mirror download system.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="font-semibold text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
              data-testid="button-browse"
            >
              <Flame className="h-5 w-5 mr-2" />
              Browse Games
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              variant="outline"
              className="backdrop-blur-sm bg-background/30 font-semibold text-lg px-8 py-6 border-2"
              data-testid="button-features"
              onClick={() => {
                const featuresSection = document.getElementById('features-section');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Features
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="text-muted-foreground/50 text-sm">
          Scroll to explore
        </div>
      </motion.div>
    </div>
  );
}
