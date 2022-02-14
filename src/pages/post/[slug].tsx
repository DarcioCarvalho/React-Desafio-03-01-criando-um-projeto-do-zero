import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import * as Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    //    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  // TODO

  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  const totalPalavras = post.data.content.reduce((acc, content) => {
    let totalBody = RichText.asText(content.body).split(/[\ ]/).length;
    let totalHeading = content.heading.split(/[\ ]/).length;

    return acc += totalBody + totalHeading;
  }, 0);

  const tempoLeitura = Math.ceil(totalPalavras / 200)


  return (
    <>
      <Head>
        <title> {post.data.title} | Space Traveling</title>
      </Head>

      <Header />

      <img className={styles.banner} src={post.data.banner.url} alt="banner" />
      <main className={styles.container + ' ' + commonStyles.container}>
        <article className={styles.post + ' ' + commonStyles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <FiCalendar />
            <time>{format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR })}</time>

            <FiUser />
            <span>{post.data.author}</span>

            <FiClock />
            <span>{tempoLeitura} min</span>
          </div>

          {post.data.content.map(({ heading, body }) => (
            <div key={heading}>
              <h3>{heading}</h3>
              <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }} />
            </div>

          ))}


        </article>
      </main>

    </>

  )

}


export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicate.at('document.type', 'posts'),
    Prismic.predicate.at('my.posts.uid', 'material-ui-e-reactjs')
    ], {
    fetch: ['posts.title']
  }
  );

  // TODO
  return {
    paths: posts.results.map(post => {
      return {
        params: {
          slug: post.uid
        }
      }
    }),
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID<any>('posts', String(slug), {});

  // TODO
  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle, //Tive que colocar por conta do test
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body]
        }
      })
    },
    uid: response.uid
  }

  return {
    props: {
      post: post
    },
    revalidate: 60 * 60 * 24 // 24 horas 
  }

};
