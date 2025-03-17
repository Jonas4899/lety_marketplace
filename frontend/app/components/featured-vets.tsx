import { Star, MapPin, Clock, Check } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

const featuredVets = [
  {
    id: 1,
    name: "Central Pet Hospital",
    image: "/placeholder.svg?height=200&width=400&text=Central Pet Hospital",
    rating: 4.9,
    reviews: 124,
    distance: "0.8 miles away",
    address: "123 Main St, Anytown",
    specialties: ["Emergency Care", "Surgery", "Dental"],
    availability: "Open Now • Closes at 8PM",
    featured: true,
  },
  {
    id: 2,
    name: "Happy Tails Veterinary",
    image: "/placeholder.svg?height=200&width=400&text=Happy Tails Veterinary",
    rating: 4.7,
    reviews: 98,
    distance: "1.2 miles away",
    address: "456 Oak Ave, Anytown",
    specialties: ["Preventive Care", "Dermatology", "Nutrition"],
    availability: "Open Now • Closes at 7PM",
    featured: true,
  },
  {
    id: 3,
    name: "Paws & Claws Animal Clinic",
    image: "/placeholder.svg?height=200&width=400&text=Paws & Claws Clinic",
    rating: 4.8,
    reviews: 112,
    distance: "1.5 miles away",
    address: "789 Pine St, Anytown",
    specialties: ["Exotic Pets", "Orthopedics", "Cardiology"],
    availability: "Open Now • Closes at 6PM",
    featured: true,
  },
];

export default function FeaturedVets() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {featuredVets.map((vet) => (
        <div
          key={vet.id}
          className="group overflow-hidden rounded-xl border bg-background shadow-sm transition-all hover:shadow-md"
        >
          <div className="relative">
            <div className="aspect-[2/1] w-full overflow-hidden bg-muted">
              <img
                src={vet.image || "/placeholder.svg"}
                alt={vet.name}
                width={400}
                height={200}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
              Featured
            </Badge>
          </div>

          <div className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{vet.name}</h3>
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{vet.rating}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ({vet.reviews})
                </span>
              </div>
            </div>

            <div className="mb-3 flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              <span>{vet.distance}</span>
            </div>

            <div className="mb-3 flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              <span>{vet.availability}</span>
            </div>

            <div className="mb-3 flex flex-wrap gap-1">
              {vet.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>

            <div className="mb-3">
              <div className="flex items-center text-sm text-green-600">
                <Check className="mr-1 h-4 w-4" />
                <span>Verified Professional</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm">
                View Profile
              </Button>
              <Button size="sm">Book Appointment</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
