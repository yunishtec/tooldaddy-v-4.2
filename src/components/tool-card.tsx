import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface ToolCardProps {
  href: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isExternal?: boolean;
  variantIndex?: number;
}

const iconBgVariants = [
    'bg-blue-500/10 border-blue-500/20 text-blue-500',
    'bg-green-500/10 border-green-500/20 text-green-500',
    'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    'bg-purple-500/10 border-purple-500/20 text-purple-500',
    'bg-pink-500/10 border-pink-500/20 text-pink-500',
    'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
    'bg-red-500/10 border-red-500/20 text-red-500',
    'bg-cyan-500/10 border-cyan-500/20 text-cyan-500',
    'bg-orange-500/10 border-orange-500/20 text-orange-500',
]

const hoverShadowVariants = [
    'group-hover:shadow-blue-500/30',
    'group-hover:shadow-green-500/30',
    'group-hover:shadow-yellow-500/30',
    'group-hover:shadow-purple-500/30',
    'group-hover:shadow-pink-500/30',
    'group-hover:shadow-indigo-500/30',
    'group-hover:shadow-red-500/30',
    'group-hover:shadow-cyan-500/30',
    'group-hover:shadow-orange-500/30',
]

const hoverBorderVariants = [
    'group-hover:border-blue-500/50',
    'group-hover:border-green-500/50',
    'group-hover:border-yellow-500/50',
    'group-hover:border-purple-500/50',
    'group-hover:border-pink-500/50',
    'group-hover:border-indigo-500/50',
    'group-hover:border-red-500/50',
    'group-hover:border-cyan-500/50',
    'group-hover:border-orange-500/50',
]

export default function ToolCard({ href, name, description, icon: Icon, isExternal, variantIndex = 0 }: ToolCardProps) {
  const variantClass = iconBgVariants[variantIndex % iconBgVariants.length];
  const shadowClass = hoverShadowVariants[variantIndex % hoverShadowVariants.length];
  const borderClass = hoverBorderVariants[variantIndex % hoverBorderVariants.length];

  const cardContent = (
     <Card className={cn(
        "h-full bg-card/50 backdrop-blur-lg border-border/20 shadow-lg transition-all duration-300 group-hover:scale-[1.02]",
        shadowClass,
        borderClass
    )}>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <div className={cn("p-3 rounded-lg border", variantClass)}>
          <Icon className={cn("h-6 w-6")} />
        </div>
        <CardTitle className="font-headline">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

  if (isExternal) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="group h-full">
            {cardContent}
        </a>
    )
  }

  return (
    <Link href={href} prefetch={true} className="group h-full">
      {cardContent}
    </Link>
  );
}
