// import "./globals.css";
// import { Geist } from "next/font/google";
// import { cn } from "@/lib/utils";

// const geist = Geist({subsets:['latin'],variable:'--font-sans'});

// export const metadata = {
//   title: "College Ride App",
//   description: "Smart college ride booking system",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" className={cn("font-sans", geist.variable)}>
//       <body>

//         {children}

//       </body>
//     </html>
//   );
// }



import "./globals.css";
import { Geist } from "next/font/google";
import { Playfair_Display, DM_Sans } from "next/font/google";  // ← add this
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

// ← Add these two
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['700', '900'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata = {
  title: "RideMate",
  description: "Campus rides made easy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(geist.variable, playfair.variable, dmSans.variable)}>
      <body>
        {children}
      </body>
    </html>
  );
}