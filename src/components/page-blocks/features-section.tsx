
import type { FeaturesBlock, FeatureItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';

// Define the type for a Lucide icon component
type LucideIconType = React.ForwardRefExoticComponent<Omit<LucideIcons.LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = LucideIcons[name as IconName] as LucideIconType | undefined;
  if (!LucideIcon) {
    return <LucideIcons.HelpCircle className={className} />;
  }
  return <LucideIcon className={className} />;
};

export default function FeaturesSection(props: FeaturesBlock) {
  const { title, subtitle, features } = props;

  return (
    <section className="py-20 sm:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-headline sm:text-4xl md:text-5xl">
            {title || 'Our Features'}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle || 'Explore the powerful features that make our service unique.'}
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features?.map((feature: FeatureItem) => (
            <Card key={feature.id} className="bg-background/50 backdrop-blur-sm border-border/20 hover:border-primary/20 hover:bg-background/70 transition-all duration-300">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-primary text-primary-foreground p-3 rounded-full">
                        <Icon name={feature.icon} className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title || 'Feature Title'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{feature.description || 'Feature description goes here.'}</p>
                </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
