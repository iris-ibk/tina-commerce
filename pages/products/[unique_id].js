import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { useShoppingCart } from '@/hooks/use-shopping-cart';
import Image from 'next/image';
import Head from 'next/head';
import { formatCurrency } from '@/lib/utils';
import { MinusSmIcon, PlusSmIcon } from '@heroicons/react/outline';
import { staticRequest, gql } from "tinacms";
import { createGlobalStyle } from "styled-components";
import { useTina } from "tinacms/dist/edit-state";
import { TinaMarkdown } from 'tinacms/dist/rich-text'

const query = gql`
  query ProductsQuery($relativePath: String!) {
    getProductsDocument(relativePath: $relativePath) {
      data {
        unique_id
        description
      }
    }
  }`

// Styles for markdown
const GlobalStyle = createGlobalStyle`
    h1,h2,h3,h4,h5 {
      margin-bottom: 1.5rem;
      margin-top: 1.5rem;
    }
    blockquote {
      background-color: rgb(209,250,229);
    }
    h1 {
      font-size: 45px;
    }
    h2 {
      font-size: 35px;
    }
    h3 {
      font-size: 25px;
    }
    h4 {
      font-size: 22px;
    }
    ul {
      padding-left: 0;
    }
    li {
      list-style-type: none;
    }
    a {
      font-weight: bold;
      color: rgb(59,130,246);
      text-decoration: underline;
    }
    `;

import products from 'products';



const Product = props => {
  const router = useRouter();
  const { cartCount, addItem } = useShoppingCart();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const toastId = useRef();
  const firstRun = useRef(true);

  const { data } = useTina({
    query,
    variables: props.variables,
    data: props.data,
  });
  console.log(props);
  let { productApi } = props;
  let { id, name, price, currency, image } = productApi;

  const handleOnAddToCart = () => {
    setAdding(true);
    toastId.current = toast.loading(
      `Adding ${qty} item${qty > 1 ? 's' : ''}...`
    );
    addItem(productApi, qty);
  };

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    setAdding(false);
    toast.success(`${qty} ${name} added`, {
      id: toastId.current,
    });
    setQty(1);
  }, [cartCount]);

  return router.isFallback ? (
    <>
      <Head>
        <title>Loading...</title>
      </Head>
      <p className="text-center text-lg py-12">Loading...</p>
    </>
  ) : (
    <>
      <Head>
        <title>{name} | AlterClass</title>
      </Head>
      <div className="container lg:max-w-screen-lg mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-12">
          {/* Product's image */}
          <div className="relative w-72 h-72 sm:w-96 sm:h-96">
            {image &&
              <Image
                src={image}
                alt={name}
                layout="fill"
                objectFit="contain"
              />
            }
          </div>

          {/* Product's details */}
          <div className="flex-1 max-w-md border border-opacity-50 rounded-md shadow-lg p-6">
            <h2 className="text-3xl font-semibold">{name}</h2>
            <p>
              <span className="text-gray-500">Availability:</span>{' '}
              <span className="font-semibold">In stock</span>
            </p>

            {/* Price */}
            <div className="mt-8 border-t pt-4">
              <p className="text-gray-500">Price:</p>
              <p className="text-xl font-semibold">
                {formatCurrency(price)}
              </p>
            </div>

            <div className="mt-4 border-t pt-4">
              {/* Quantity */}
              <p className="text-gray-500">Quantity:</p>
              <div className="mt-1 flex items-center space-x-3">
                <button
                  onClick={() => setQty(prev => prev - 1)}
                  disabled={qty <= 1}
                  className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-current hover:bg-rose-100 hover:text-rose-500 rounded-md p-1"
                >
                  <MinusSmIcon className="w-6 h-6 flex-shrink-0" />
                </button>
                <p className="font-semibold text-xl">{qty}</p>
                <button
                  onClick={() => setQty(prev => prev + 1)}
                  className="hover:bg-green-100 hover:text-green-500 rounded-md p-1"
                >
                  <PlusSmIcon className="w-6 h-6 flex-shrink-0 " />
                </button>
              </div>

              {/* Add to cart button */}
              <button
                type="button"
                onClick={handleOnAddToCart}
                disabled={adding}
                className="mt-8 border rounded py-2 px-6 bg-rose-500 hover:bg-rose-600 border-rose-500 hover:border-rose-600 focus:ring-4 focus:ring-opacity-50 focus:ring-rose-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to cart ({qty})
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticPaths() {
  return {
    // Existing posts are rendered to HTML at build time
    paths: Object.keys(products)?.map(id => ({
      params: { unique_id: id },
    })),
    // Enable statically generating additional pages
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  let data = {}
  const variables = { relativePath: `${params.unique_id}.md` }

  try {
    const productApi = products?.find(product => product.id === params.unique_id) ?? {};
    data = await staticRequest({
      query,
      variables
    })

    return {
      props: {
        data,
        productApi,
        variables,
      },
      // Next.js will attempt to re-generate the page:
      // - When a request comes in
      // - At most once every second
      revalidate: 1, // In seconds
    };
  } catch (error) {
    return { notFound: true };
  }
}

export default Product;
