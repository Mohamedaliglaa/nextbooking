"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function VehicleOptionsSection() {
  const vehicles = [
    { title: "Économique", desc: "Trajets abordables pour des déplacements courts." },
    { title: "Confort", desc: "Véhicules spacieux pour un trajet quotidien confortable." },
    { title: "Luxe", desc: "Véhicules premium pour occasions spéciales ou trajets longue distance." },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">Types de véhicules</h2>
        <Swiper spaceBetween={20} slidesPerView={1} breakpoints={{640:{slidesPerView:1},768:{slidesPerView:2},1024:{slidesPerView:3}}}>
          {vehicles.map((v, idx) => (
            <SwiperSlide key={idx}>
              <motion.div whileHover={{ scale: 1.05 }} className="p-6">
                <Card className="p-6 hover:shadow-lg transition">
                  <CardTitle className="text-lg font-semibold">{v.title}</CardTitle>
                  <CardContent>{v.desc}</CardContent>
                </Card>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
