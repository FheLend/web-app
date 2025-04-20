
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
        <section>
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
      </div>
    </div>
  );
};

export default UILibrary;
