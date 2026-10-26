import { SiteHeaderClient, SiteFooterClient } from "@/components/SiteChrome";
import { HomeSections } from "@/components/sections/Home";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "@id": "https://sandunevilla.vn/#villa",
  name: "SanDune Villa",
  alternateName: "SanDune Villa Đà Nẵng",
  description:
    "Villa nguyên căn ba tầng tại Mỹ Khê, Đà Nẵng: năm phòng ngủ, hồ bơi nước mặn, phòng xông hơi, khu BBQ ngoài trời, cách biển vài bước chân.",
  url: "https://sandunevilla.vn/",
  image: [
    "https://sandunevilla.vn/assets/photo-pool-dusk.png",
    "https://sandunevilla.vn/assets/photo-pool-hammocks.png",
    "https://sandunevilla.vn/assets/photo-living.png",
  ],
  telephone: "+84963159933",
  email: "trinhgia.jsc.vn@gmail.com",
  priceRange: "15.000.000 VND / đêm",
  address: {
    "@type": "PostalAddress",
    streetAddress: "43 Mỹ Khê 1",
    addressLocality: "Sơn Trà",
    addressRegion: "Đà Nẵng",
    addressCountry: "VN",
  },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Hồ bơi nước mặn", value: true },
    { "@type": "LocationFeatureSpecification", name: "Phòng xông hơi", value: true },
    { "@type": "LocationFeatureSpecification", name: "Khu BBQ ngoài trời", value: true },
    { "@type": "LocationFeatureSpecification", name: "Bếp đầy đủ tiện nghi", value: true },
  ],
  sameAs: [],
};

export const metadata = {
  title: { absolute: "SanDune Villa Đà Nẵng · Villa nguyên căn 5 phòng ngủ, hồ bơi nước mặn gần biển Mỹ Khê" },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <SiteHeaderClient />
      <HomeSections />
      <SiteFooterClient />
    </>
  );
}
