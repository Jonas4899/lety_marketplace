import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export default function FilterPanel() {
  const [distance, setDistance] = useState([5]);

  return (
    <div className="rounded-lg border bg-background p-4">
      <h3 className="mb-4 font-semibold">Filter Results</h3>

      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name"
            className="w-full pl-8"
          />
        </div>

        <Button variant="outline" size="sm" className="w-full">
          Clear All Filters
        </Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={[
          "distance",
          "services",
          "availability",
          "pets",
          "ratings",
        ]}
      >
        <AccordionItem value="distance">
          <AccordionTrigger>Distance</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm">Max Distance</span>
                  <span className="text-sm font-medium">
                    {distance[0]} miles
                  </span>
                </div>
                <Slider
                  value={distance}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={setDistance}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="services">
          <AccordionTrigger>Services</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[
                "General Checkup",
                "Vaccination",
                "Surgery",
                "Dental Care",
                "Emergency Care",
                "Grooming",
                "Boarding",
                "Behavioral Consultation",
              ].map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox id={`service-${service}`} />
                  <Label htmlFor={`service-${service}`} className="text-sm">
                    {service}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="open-now" />
                <Label htmlFor="open-now" className="text-sm">
                  Open Now
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="open-weekends" />
                <Label htmlFor="open-weekends" className="text-sm">
                  Open Weekends
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="24-hours" />
                <Label htmlFor="24-hours" className="text-sm">
                  24/7 Service
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="same-day" />
                <Label htmlFor="same-day" className="text-sm">
                  Same-Day Appointments
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pets">
          <AccordionTrigger>Pet Types</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[
                "Dogs",
                "Cats",
                "Birds",
                "Small Mammals",
                "Reptiles",
                "Exotic Pets",
              ].map((pet) => (
                <div key={pet} className="flex items-center space-x-2">
                  <Checkbox id={`pet-${pet}`} />
                  <Label htmlFor={`pet-${pet}`} className="text-sm">
                    {pet}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ratings">
          <AccordionTrigger>Ratings</AccordionTrigger>
          <AccordionContent>
            <RadioGroup defaultValue="any">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="rating-any" />
                <Label htmlFor="rating-any" className="text-sm">
                  Any Rating
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4plus" id="rating-4plus" />
                <Label htmlFor="rating-4plus" className="text-sm">
                  4+ Stars
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3plus" id="rating-3plus" />
                <Label htmlFor="rating-3plus" className="text-sm">
                  3+ Stars
                </Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <RadioGroup defaultValue="any">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="price-any" />
                <Label htmlFor="price-any" className="text-sm">
                  Any Price
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="$" id="price-$" />
                <Label htmlFor="price-$" className="text-sm">
                  $
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="$$" id="price-$$" />
                <Label htmlFor="price-$$" className="text-sm">
                  $$
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="$$$" id="price-$$$" />
                <Label htmlFor="price-$$$" className="text-sm">
                  $$$
                </Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
