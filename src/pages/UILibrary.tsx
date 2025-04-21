
import { useEffect } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Image } from "@/components/ui/image";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TransactionLoadingDemo } from "@/components/ui/transaction-loading-demo";

const UILibrary = () => {
  const { potentialAdmin } = useAdminAuthContext();
  const { cardStyles } = useThemeStyles();

  if (!potentialAdmin) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
        <p>Please connect your wallet to view the UI Library.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">UI Component Library</h1>
      
      <div className="grid gap-8">
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

        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Tables</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Admin</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Forms and Advanced Inputs</h2>
          <div className="grid gap-4">
            <Textarea placeholder="Enter your message" />
            <InputOTP maxLength={6}>
              <InputOTPGroup>
                {new Array(6).fill(0).map((_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </section>

        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Dialogs and Sheets</h2>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog Title</DialogTitle>
                  <DialogDescription>Dialog description goes here.</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger asChild>
                <Button>Open Sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sheet Title</SheetTitle>
                  <SheetDescription>Sheet description goes here.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Drawer>
              <DrawerTrigger asChild>
                <Button>Open Drawer</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Drawer Title</DrawerTitle>
                  <DrawerDescription>Drawer description goes here.</DrawerDescription>
                </DrawerHeader>
              </DrawerContent>
            </Drawer>
          </div>
        </section>

        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Command and Navigation</h2>
          <div className="space-y-4">
            <Command>
              <CommandInput placeholder="Type a command..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  <CommandItem>Profile</CommandItem>
                  <CommandItem>Settings</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>

            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="/ui">UI</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
        </section>

        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Toggles and Switches</h2>
          <div className="flex items-center gap-4">
            <Switch />
            <Toggle>Toggle</Toggle>
            <ToggleGroup type="single">
              <ToggleGroupItem value="left">Left</ToggleGroupItem>
              <ToggleGroupItem value="center">Center</ToggleGroupItem>
              <ToggleGroupItem value="right">Right</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </section>

        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Tabs and Pagination</h2>
          <div className="space-y-4">
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">Tab 1 content</TabsContent>
              <TabsContent value="tab2">Tab 2 content</TabsContent>
            </Tabs>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </section>

        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Tooltips and Images</h2>
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button>Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tooltip content</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Image
              src="https://picsum.photos/200"
              alt="Sample image"
              className="w-32 h-32 rounded"
              fallback={<Skeleton className="w-32 h-32 rounded" />}
            />
          </div>
        </section>

        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Resizable Panels</h2>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel>Left panel</ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>Right panel</ResizablePanel>
          </ResizablePanelGroup>
        </section>

        <section className={`${cardStyles} p-6 rounded-lg`}>
          <h2 className="text-2xl font-bold mb-4">Transaction Loading</h2>
          <div className="flex flex-wrap gap-4">
            <TransactionLoadingDemo />
          </div>
        </section>
      </div>
    </div>
  );
};

export default UILibrary;
