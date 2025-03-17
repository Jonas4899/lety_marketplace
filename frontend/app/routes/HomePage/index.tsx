import { Search, MapPin, Star, Filter, ChevronDown } from "lucide-react";
import { Link } from "react-router";
import VetMap from "~/components/vet-map";
import FeaturedVets from "~/components/featured-vets";
import FilterPanel from "~/components/filter-panel";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { useState } from "react";
import { UserTypeModal } from "~/components/user-type-modal";
import { PetOwnerSignup } from "~/components/pet-owner-signup";

export default function Home() {
  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);
  const [isPetOwnerSignupOpen, setIsPetOwnerSignupOpen] = useState(false);
  const [isVetClinicSignupOpen, setIsVetClinicSignupOpen] = useState(false);

  const handleUserTypeSelect = (
    userType: "pet-owner" | "vet-clinic" | null
  ) => {
    setIsUserTypeModalOpen(false);

    if (userType === "pet-owner") {
      setIsPetOwnerSignupOpen(true);
    } else if (userType === "vet-clinic") {
      setIsVetClinicSignupOpen(true);
    }
  };

  const handleBackToUserType = () => {
    setIsPetOwnerSignupOpen(false);
    setIsVetClinicSignupOpen(false);
    setIsUserTypeModalOpen(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen flex-col w-full ">
      {/* Header */}
      <header className="flex justify-center sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">
              LETY MARKETPLACE
            </span>
          </Link>

          <div className="hidden md:flex md:flex-1 md:justify-center md:px-12">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for veterinary services..."
                className="w-full pl-8 md:w-[300px] lg:w-[400px]"
              />
            </div>
          </div>

          {/* Find the header section with the Sign Up and Sign In buttons */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setIsUserTypeModalOpen(true)}
            >
              Registrarse
            </Button>
            <Button asChild>
              <Link to="/login">Iniciar sesion</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="container relative z-10 flex flex-col items-center justify-center py-24 text-center text-white md:py-32">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Connecting pet lovers with veterinary professionals
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/90">
            Find the perfect veterinary care for your beloved pets, all in one
            place
          </p>

          <div className="mt-10 w-full max-w-md">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Find clinics near your location"
                className="w-full bg-white pl-10 text-black"
              />
              <Button className="absolute right-0 top-0 rounded-l-none">
                Search
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Badge
              variant="secondary"
              className="bg-white/20 hover:bg-white/30"
            >
              Emergency Care
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/20 hover:bg-white/30"
            >
              Vaccination
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/20 hover:bg-white/30"
            >
              Dental Care
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/20 hover:bg-white/30"
            >
              Surgery
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/20 hover:bg-white/30"
            >
              Grooming
            </Badge>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="w-full flex justify-around border-b bg-muted/40 py-4">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">Find Veterinary Services</h2>
              <Badge className="ml-2">
                {Math.floor(Math.random() * 100) + 150} results
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                Sort by: Recommended
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                View: List
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-8">
        <div className="container">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Filter Panel */}
            <div className="hidden lg:block">
              <FilterPanel />
            </div>

            {/* Results */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-bold">
                  Featured Veterinary Practices
                </h2>
                <FeaturedVets />
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    Veterinary Clinics Near You
                  </h2>
                  <Button variant="link" className="font-medium">
                    View All
                  </Button>
                </div>

                <div className="mb-6 overflow-hidden rounded-xl border">
                  <VetMap />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="group overflow-hidden rounded-lg border transition-all hover:shadow-md"
                    >
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={`https://images.unsplash.com/photo-1584381296550-99dfc0837d42?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
                          alt={`Vet Clinic ${i + 1}`}
                          width={400}
                          height={200}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>

                      <div className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-semibold">
                            Healthy Paws Clinic {i + 1}
                          </h3>
                          <div className="flex items-center">
                            <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {(4 + Math.random()).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <p className="mb-2 text-sm text-muted-foreground">
                          Full-service veterinary clinic with emergency care
                        </p>

                        <div className="mb-3 flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span>
                            {1 + Math.floor(Math.random() * 5)} miles away
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            Dogs
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Cats
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Exotic
                          </Badge>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Available today
                          </span>
                          <Button size="sm">Book Now</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <Button variant="outline" className="min-w-[150px]">
                    Load More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t bg-muted/30 py-12">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">
            What Pet Owners Say
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-background p-6 shadow-sm">
                <div className="mb-4 flex">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-5 w-5 ${
                        j < 4 + (i % 2)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>

                <p className="mb-4 italic text-muted-foreground">
                  "The marketplace made it so easy to find the perfect vet for
                  my cat. The booking process was seamless and I love being able
                  to see reviews from other pet owners."
                </p>

                <div className="flex items-center">
                  <div className="mr-3 h-10 w-10 overflow-hidden rounded-full bg-muted">
                    <img
                      src={`https://images.unsplash.com/photo-1584381296550-99dfc0837d42?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
                      alt="User"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">
                      Pet Parent to Max
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-12 text-primary-foreground">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Are you a veterinary professional?
          </h2>
          <p className="mx-auto mb-6 max-w-2xl">
            Join our marketplace to connect with pet owners in your area and
            grow your practice.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button variant="secondary" size="lg">
              Join as a Vet
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold">PETVET MARKETPLACE</h3>
              <p className="text-sm text-muted-foreground">
                Connecting pet owners with quality veterinary care since 2023.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">FOR PET OWNERS</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Find a Vet
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Emergency Care
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pet Health Articles
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">FOR VETERINARIANS</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Join the Platform
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Partner Benefits
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Success Stories
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Resources
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">COMPANY</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Press
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between border-t pt-8 sm:flex-row">
            <p className="mb-4 text-sm text-muted-foreground sm:mb-0">
              &copy; {new Date().getFullYear()} PetVet Marketplace. All rights
              reserved.
            </p>
            <div className="flex gap-4">
              <Link
                to="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                to="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                to="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
      {/* Modals */}
      <UserTypeModal
        open={isUserTypeModalOpen}
        onOpenChange={setIsUserTypeModalOpen}
        onSelectUserType={handleUserTypeSelect}
      />

      <PetOwnerSignup
        open={isPetOwnerSignupOpen}
        onOpenChange={setIsPetOwnerSignupOpen}
        onBack={handleBackToUserType}
      />
    </div>
  );
}
