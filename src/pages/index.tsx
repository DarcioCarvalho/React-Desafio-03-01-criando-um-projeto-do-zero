import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';
import * as Prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function postReduced(post: any) {
  return {
    uid: post.uid,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy' /* "d' 'LLL' 'yyyy" */,
      { locale: ptBR }
    ),
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author
    }
  }
}

export default function Home({ postsPagination }: HomeProps) {
  //   // TODO

  const [posts, setPosts] = useState<Post[]>(
    postsPagination.results.map(post => postReduced(post))
  );
  const [next_page, setNext_page] = useState(postsPagination.next_page)

  async function loadMorePosts(): Promise<void> {

    const response = await fetch(`${next_page}`).then(data =>
      data.json()
    );

    const postResponse = response.results.map(post => postReduced(post));

    /* const postResponse = response.results.map(post => ({
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        "d' 'LLL' 'yyyy",
        { locale: ptBR }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    })); */

    setPosts([...posts, ...postResponse]);
    setNext_page(response.next_page);

  }


  return (
    <>
      <Head>
        <title>Post | spacetraveling</title>
      </Head>

      <Header />

      <main className={styles.container + ' ' + commonStyles.container}>
        <div className={styles.post + ' ' + commonStyles.post}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div>
                  <FiCalendar />
                  <time>{post.first_publication_date}</time>

                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}

          {
            next_page ? <button type='button' onClick={loadMorePosts}> Carregar mais posts</button> : ''
          }

        </div>
      </main>
    </>


  )
}

export const getStaticProps: GetStaticProps = async () => {

  const prismic = getPrismicClient();

  const postsResponse = await prismic.query<any>([
    Prismic.predicate.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 2
  })


  // TODO

  const results: Post[] = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }

    }
  })


  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results
      }
    },
    revalidate: 60 * 60 * 24 // 24 horas 
  }

};
