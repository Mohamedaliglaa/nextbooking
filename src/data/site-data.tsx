import { Car, MapPin, Smartphone, Globe, Mail, Linkedin, Github, Clock, ShieldCheck, Users } from 'lucide-react'

export const siteConfig = {
  name: 'TaxiGo',
  description: 'Fast, secure, and reliable taxi booking service.',
  url: 'https://taxigo.tn',
  email: 'support@taxigo.tn',
}

export const heroData = {
  badge: 'Reliable Taxi Service',
  title: 'Book Your Ride Anytime, Anywhere',
  description: 'TaxiGo offers instant ride booking, professional drivers, real-time tracking, and safe travel to your destination with just a few taps.',
}

export const stats = [
  { value: '1500+', label: 'Rides Completed' },
  { value: '4.9/5', label: 'Customer Rating' },
  { value: '24/7', label: 'Service Availability' },
  { value: '120+', label: 'Verified Drivers' },
]

export const services = [
  {
    icon: Car,
    title: 'Quick Taxi Booking',
    description: 'Book a taxi in seconds with real-time driver availability and location detection.',
  },
  {
    icon: MapPin,
    title: 'Live Ride Tracking',
    description: 'Track your taxi from pickup to arrival with accurate GPS tracking.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Smooth booking experience on web and mobile devices.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety First',
    description: 'Licensed drivers, verified profiles, and secure payment options.',
  },
  {
    icon: Users,
    title: 'Shared & Private Rides',
    description: 'Choose between private rides or save money with shared trips.',
  },
  {
    icon: Clock,
    title: 'Schedule a Ride',
    description: 'Book rides in advance for airports, appointments, and events.',
  },
]

export const process = [
  {
    step: '01',
    title: 'Choose Your Destination',
    description: 'Enter your pickup and drop-off locations to get ride estimates.',
  },
  {
    step: '02',
    title: 'Match with a Driver',
    description: 'A nearby verified driver will accept your ride instantly.',
  },
  {
    step: '03',
    title: 'Track Your Ride',
    description: 'Follow real-time route tracking and contact your driver when needed.',
  },
  {
    step: '04',
    title: 'Arrive Safely & Pay',
    description: 'Enjoy your ride and pay securely through the app or cash.',
  },
]

export const technologies = [
  'React', 'Next.js', 'TypeScript', 'Node.js',
  'Firebase', 'Google Maps API', 'PostgreSQL', 'Tailwind CSS'
]

export const features = [
  'Fast and Secure Booking',
  'Verified and Professional Drivers',
  'GPS-Based Ride Tracking',
  'Multiple Payment Options',
  'Affordable Pricing & Fare Estimates',
  'Ride Scheduling and History',
  '24/7 Customer Support',
  'Modern & Easy-to-use Interface'
]

export const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
]

export const stack = [
  { name: "Next Js", svg: "logo/light-next-svgrepo-com.svg" },
  { name: "React", svg: "logo/reactjs-svgrepo-com.svg" },
  { name: "Tailwindcss", svg: "logo/tailwind-svgrepo-com.svg" },
  { name: "Node", svg: "logo/node-svgrepo-com.svg" },
  { name: "Prisma", svg: "logo/prisma-svgrepo-com.svg" },
  { name: "PostgreSQL", svg: "logo/pgsql-svgrepo-com.svg" },
  { name: "Firebase", svg: "logo/firebase-svgrepo-com.svg" },
  { name: "Google Maps API", svg: "logo/google-maps-svgrepo-com.svg" },
]
