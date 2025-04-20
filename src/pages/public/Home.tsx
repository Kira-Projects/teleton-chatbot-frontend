import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"


const Home = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
      <div className="min-h-screen relative">
        {/* Background Image */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: "url('/banner.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
  
        {/* Fixed Navbar */}
        <nav className="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-4 py-2 bg-white rounded-lg mt-4 mx-auto max-w-6xl w-[95%]">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Teleton Logo" className="h-8" />
            <img src="/juntos.webp" alt="Juntos Logo" className="h-8 hidden sm:block" />
          </div>
  
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Button variant="ghost" className='text-[#6C757D]'>Cómo ingresar a Teletón</Button>
            <Button variant="ghost" className='text-[#6C757D]'>¿Qué hacemos con tu aporte?</Button>
            <Button variant="ghost" className='text-[#6C757D]'>Gen-T</Button>
            <Button variant="secondary" className="bg-[#6C63AC] text-white hover:bg-[#5c54a0] rounded-full">
              Transparencia
            </Button>
            <Button variant="default" className="bg-ttred hover:bg-[#d13844] rounded-full">
              Más sobre Teletón
            </Button>
          </div>
  
          {/* Mobile Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full h-screen bg-[#E84855]">
              <SheetHeader>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="Teleton Logo" className="h-8" />
                    <img src="/juntos.png" alt="Juntos Logo" className="h-8" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white hover:text-white/80"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-12">
                <Button 
                  variant="ghost" 
                  className="text-white text-xl justify-start hover:text-white/80 hover:bg-transparent"
                >
                  Cómo ingresar a Teletón
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-white text-xl justify-start hover:text-white/80 hover:bg-transparent"
                >
                  ¿Qué hacemos con tu aporte?
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-white text-xl justify-start hover:text-white/80 hover:bg-transparent"
                >
                  Gen-T
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
  
        {/* Fixed Counter Banner */}
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center px-4 py-2 bg-ttred text-white rounded-lg mt-4 mx-auto max-w-6xl w-[95%]">
          <p className="text-xl sm:text-2xl font-bold uppercase">cómputo
          $4.001.431.592</p>
        </div>
  
        {/* Main Content */}
        <main className="relative z-10 pt-52 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Teletón 2024: ¡tu aporte nos permite seguir rehabilitando!
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 max-w-4xl mx-auto">
              Con tu donación, más de 32 mil niños, niñas y jóvenes podrán seguir avanzando en sus procesos de rehabilitación, sin costo alguno, en nuestros 14 institutos del país. Cada aporte cuenta y hace posible un futuro con más inclusión y esperanza para miles de familias.
            </p>
            <Button size="lg" className="bg-[#E84855] hover:bg-[#d13844] text-xl px-8">
              HAZ TU APORTE AQUÍ
            </Button>
          </div>
        </main>
  
  
        {/* Fixed Chat Button */}
#
      </div>
    )
};

export default Home;
