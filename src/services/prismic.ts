import * as Prismic from '@prismicio/client';
//import { DefaultClient } from '@prismicio/client/types/client';


export function getPrismicClient() {

  const prismic = Prismic.createClient(
    process.env.PRISMIC_API_ENDPOINT
  )

  return prismic;
}



/* export function getPrismicClient(req?: unknown): DefaultClient {
  const prismic = Prismic.client(process.env.PRISMIC_API_ENDPOINT, {
    req,
  });

  return prismic;
} */

