import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import * as Prismic from '@prismicio/client';


import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';
import Comments from '../../components/Comments';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';


interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string | null;
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

interface NavigationPost {
  uid: string;
  data: {
    title: string;
  }
}

interface PostProps {
  post: Post;
  preview: boolean;
  navigation: {
    prevPost: NavigationPost;
    nextPost: NavigationPost;
  }
}

export default function Post({ post, preview, navigation }: PostProps) {
  // TODO

  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  const totalWords = post.data.content.reduce((acc, content) => {
    let totalWordsBody = RichText.asText(content.body).split(/[\ ]/).length;
    let totalWordsHeading = content.heading.split(/[\ ]/).length;

    return acc += totalWordsBody + totalWordsHeading;
  }, 0);

  const readingTime = Math.ceil(totalWords / 200)

  return (
    <>
      <Head>
        <title> {post.data.title} | Space Traveling</title>
      </Head>

      <Header />

      <img className={styles.banner} src={post.data.banner.url ?? '/images/no_image.png'} alt="banner" />
      <main className={styles.container + ' ' + commonStyles.container}>
        <article className={styles.post + ' ' + commonStyles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <FiCalendar />
            <time>{format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR })}</time>

            <FiUser />
            <span>{post.data.author}</span>

            <FiClock />
            <span>{readingTime} min</span>
          </div>

          {post.last_publication_date && (
            <time className={styles.editado}>{format(new Date(post.last_publication_date), "'* editado em' dd MMM yyyy', às' H':'m", { locale: ptBR })}</time>
          )}

          {post.data.content.map(({ heading, body }) => (
            <div key={heading}>
              <h3>{heading}</h3>
              <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }} />
            </div>

          ))}

        </article>
      </main>

      <footer className={styles.footer}>
        <hr />

        <section className={styles.navigation}>

          <div className={styles.postAnterior}>
            {navigation?.prevPost && (
              <>
                <h3>{navigation.prevPost.data.title}</h3>
                <Link href={`/post/${navigation.prevPost.uid}`}>
                  <a>Post anterior</a>
                </Link>
              </>
            )}
          </div>

          <div className={styles.proximoPost}>
            {navigation?.nextPost && (
              <>
                <h3>{navigation.nextPost.data.title}</h3>
                <Link href={`/post/${navigation.nextPost.uid}`}>
                  <a>Próximo post</a>
                </Link>
              </>
            )}
          </div>

        </section>

        <Comments className={styles.comments} />

        {preview && (
          <aside>
            <Link href='/api/exit-preview'>
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </footer>

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

export const getStaticProps: GetStaticProps = async ({ preview = false, previewData, ...context }) => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID<any>('posts', String(slug), {
    ref: previewData?.ref ?? null
  });


  const prevResponse = await prismic.query<any>([
    Prismic.predicate.at('document.type', 'posts')
  ], {
    pageSize: 1,
    after: response.id,
    orderings: 'document.first_publication_date'
  })

  const nextResponse = await prismic.query<any>([
    Prismic.predicate.at('document.type', 'posts')
  ], {
    pageSize: 1,
    after: response.id,
    orderings: 'document.first_publication_date desc'
  })


  // TODO
  const post = {
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url ?? null
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
      post,
      preview,
      navigation: {
        prevPost: prevResponse.results[0] ?? null,
        nextPost: nextResponse.results[0] ?? null,
      }
    },
    revalidate: 60 * 60 * 24 // 24 hours 
  }

};
