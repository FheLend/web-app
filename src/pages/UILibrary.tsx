
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuthContext } from "@/providers/AdminAuthProvider";
import { Button } from "@/components/ui/button";
import { useThemeStyles } from "@/lib/themeUtils";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { AlertCircle } from "lucide-react";

const UILibrary = () => {
  const { isAdmin } = useAdminAuthContext();
  const navigate = useNavigate();
  const { cardStyles } = useThemeStyles();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/404");
    }
  }, [isAdmin, navigate]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">UI Component Library</h1>
      
      <div className="grid gap-8">
        {/* Basic Inputs Section */}
        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Basic Inputs</h2>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" placeholder="Enter your email" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Accept terms and conditions</Label>
            </div>
            <RadioGroup defaultValue="option-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-1" id="option-1" />
                <Label htmlFor="option-1">Option 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-2" id="option-2" />
                <Label htmlFor="option-2">Option 2</Label>
              </div>
            </RadioGroup>
          </div>
        </section>

        {/* Buttons Section */}
        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        {/* Cards Section */}
        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Cards</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card Description</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card content goes here.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badges and Progress Section */}
        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Badges and Progress</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <Progress value={60} className="w-full" />
          </div>
        </section>

        {/* Select and Calendar Section */}
        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Select and Calendar</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Option 1</SelectItem>
                <SelectItem value="2">Option 2</SelectItem>
                <SelectItem value="3">Option 3</SelectItem>
              </SelectContent>
            </Select>
            <div className="rounded-md border">
              <Calendar />
            </div>
          </div>
        </section>

        {/* Navigation Section */}
        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Navigation</h2>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Item One
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Item Two
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </section>

        {/* Accordion Section */}
        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Accordion</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it styled?</AccordionTrigger>
              <AccordionContent>
                Yes. It comes with default styles that matches your theme.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Avatar and Alert Section */}
        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Avatar and Alert</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Your session has expired. Please log in again.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Scroll Area Demo */}
        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Scroll Area</h2>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="text-sm font-medium">Item {i + 1}</h4>
                  <p className="text-sm text-muted-foreground">
                    Scrollable content item {i + 1} description goes here.
                  </p>
                  <Separator />
                </div>
              ))}
            </div>
          </ScrollArea>
        </section>
      </div>
    </div>
  );
};

export default UILibrary;
