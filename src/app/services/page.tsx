import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ServiceListSection } from "@/components/services/ServiceListSection";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  caretakerRequirements,
  companionSupport,
  errandsAndPersonal,
  homeCareDuties,
  homeCareNursing,
  otherActivities,
  serviceCategories,
  servicesHeadline,
  skilledNursingServices,
} from "@/content/servicesCatalog";
import { servicesContent } from "@/content/site";

export const metadata: Metadata = {
  title: "Our Services",
  description: servicesHeadline,
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title={servicesHeadline}
        description={servicesContent.intro}
        cta={{ label: "Request a Free Consultation →", href: "/contact" }}
      />

      <section className="section-pad bg-purple-50">
        <div className="site-container">
          <h2 className="font-display m-0 mb-10 text-center text-3xl uppercase">Our Services</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCategories.map((cat) => (
              <article key={cat.id} id={cat.id} className="card-soft scroll-mt-28 overflow-hidden">
                <div className="relative h-44">
                  <Image src={cat.image} alt={cat.title} fill className="object-cover" sizes="360px" />
                </div>
                <div className="p-5">
                  <h3 className="font-display m-0 text-xl text-purple-900">{cat.title}</h3>
                  <Link
                    href="/contact"
                    className="mt-3 inline-block text-sm font-bold text-purple-700 hover:underline"
                  >
                    Learn more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ServiceListSection
        variant="brand"
        title={caretakerRequirements.title}
        intro={caretakerRequirements.intro}
        items={caretakerRequirements.items}
        image={caretakerRequirements.image}
        id="caretaker-requirements"
      />

      <ServiceListSection
        title={homeCareDuties.title}
        columns={homeCareDuties.columns}
        image={homeCareDuties.image}
        id="home-care-duties"
      />

      <ServiceListSection
        variant="brand"
        title={skilledNursingServices.title}
        columns={skilledNursingServices.columns}
        image={skilledNursingServices.image}
        id="skilled-nursing"
      />

      <ServiceListSection
        title={otherActivities.title}
        items={otherActivities.items}
        image={otherActivities.image}
        id="other-activities"
      />

      <ServiceListSection
        title={companionSupport.title}
        items={companionSupport.items}
        image={companionSupport.image}
        id="companion-support"
      />

      <section className="section-pad bg-purple-50" id="errands-personal">
        <div className="site-container">
          <Image
            src={errandsAndPersonal.image}
            alt="Errands and personal care"
            width={900}
            height={400}
            className="mx-auto mb-10 w-full max-w-3xl rounded-xl object-cover"
          />
          <div className="grid gap-10 md:grid-cols-2">
            {errandsAndPersonal.sections.map((section) => (
              <article key={section.title} className="card-soft p-8">
                <h3 className="font-display m-0 text-xl text-purple-900">{section.title}</h3>
                <ul className="mt-4 space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="text-sm font-medium text-purple-900">
                      • {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ServiceListSection
        title={homeCareNursing.title}
        intro={homeCareNursing.intro}
        items={homeCareNursing.bullets}
        image={homeCareNursing.image}
        id="home-care-nursing"
      />

      <section className="section-pad text-center">
        <div className="site-container">
          <ButtonLink href="/contact" variant="purple">Start Your Care Plan →</ButtonLink>
        </div>
      </section>
    </>
  );
}
