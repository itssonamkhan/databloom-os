import Link from "next/link";

type FeatureCardProps = {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
};

export default function FeatureCard({
  title,
  description,
  href,
  icon,
  color,
}: FeatureCardProps) {
  return (
    <Link href={href}>

      <div
        className={`
        rounded-3xl
        p-8
        shadow-xl
        bg-white
        hover:scale-105
        transition-all
        duration-300
        cursor-pointer
        border
        ${color}
        `}
      >

        <div className="text-5xl mb-5">
          {icon}
        </div>


        <h2 className="text-2xl font-bold text-purple-700">
          {title}
        </h2>


        <p className="mt-4 text-gray-600">
          {description}
        </p>


      </div>

    </Link>
  );
}