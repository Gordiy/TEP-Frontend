"use client"

import { productDescriptions } from "data";
import { GoodsUrl } from "route-urls";
import { isStr } from "utils/js-types";

import ProductsFilters from "components/Filters/ProductsFilters";
import { CompareBanner } from "components/Goods/CompareBanner";
import { PopularGoods } from "components/Goods/PopularGoods";
import ProductDescriptions from "components/Goods/ProductDescriptions";
import ProductHeader from "components/Goods/ProductHeader";
import ProductsList from "components/Goods/ProductsList";
import BlanketIMG from "components/Goods/static/blanket.jpg";
import { Category, DefaultCategory } from "contexts/CategoriesContext"
import { StaticImageData } from "next/image";
import { useLocalization } from "contexts/LocalizationContext";

import { useEffect, useState } from "react"

const blankets = [...Array(15)].map((_, Idx) => ({
  id: (Idx + 1).toString(),
  title: "Dream",
  category: "blankets",
  image: BlanketIMG,
  price: 1199,
}));

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


const sortings : { [key: string]: (a: ProductToShow, b: ProductToShow) => number }  = {
  "suitable": (a: ProductToShow, b: ProductToShow) => {
    return randomInt(-1, 1);
    //TO DO
  },
  "asc": (a: ProductToShow, b: ProductToShow) => {
    return a.price - b.price;
  },
  "desc": (a: ProductToShow, b: ProductToShow) => {
    return b.price - a.price;
  },
  "new": (a: ProductToShow, b: ProductToShow) => {
    if (a.date > b.date) {
      return -1;
    }
    if (a.date < b.date) {
      return 1;
    }
    return 0;
  },
  "title": (a: ProductToShow, b: ProductToShow) => {
    if (a.title < b.title) {
      return -1;
    }
    if (a.title > b.title) {
      return 1;
    }
    return 0;
  },
  "popular": (a: ProductToShow, b: ProductToShow) => {
    return b.number_of_views - a.number_of_views;
  },
}

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

const APIurl = process.env.NEXT_PUBLIC_API_URL;

interface Product {
  category: Category;
  description: string;
  description_en: string;
  description_uk: string;
  group_id: string;
  id: number;
  slug: string;
  title: string;
  title_en: string;
  title_uk: string;
}

interface Color {
  hex: string;
  id: number;
  slug: string;
  title: string;
  title_en: string;
  title_uk: string;
}

interface Material {
  id: number;
  slug: string;
  title: string;
  title_en: string;
  title_uk: string;
}

interface Size {
  id: number;
  slug: string;
  title: string;
  title_en: string;
  title_uk: string;
}

interface ProductVariant {
  colors: Color[];
  count: number;
  default_price: number;
  drop_shipping_price: number;  
  id: number;
  main_image: string;
  materials: Material[];
  product: number;
  promo_price: number;
  promotion: boolean;
  sizes: Size[];
  sku: string;
  title: string;
  title_en: string;
  title_uk: string;
  variant_order: number;
  wholesale_price: number;
}

export interface ProductWithVariant {
  category: Category;
  description: string;
  description_en: string;
  description_uk: string;
  group_id: string;
  id: number;
  slug: string;
  title: string;
  title_en: string;
  title_uk: string;
  product_variants: ProductVariant[];
}

export type ProductToShow = {
  id: string;
  article?: string;
  color?: string;
  isInStock?: boolean;
  description?: string;
  size?: string[] | string;
  title: string;
  category_slug: string;
  category_title: string;
  image: StaticImageData | string;
  price: number;
  number_of_views: number;
  date: string;
  isInCart?: boolean;
  isInCompare?: boolean;
  isFavourite?: boolean;
  count?: number;
  isSale?: boolean;
  salePrice?: number;
};

export default function CategoryPage({
  searchParams, params
}: {
  searchParams: SearchParams;
  params: { category: string };
}) {
  const { page } = searchParams;
  let activePageNum = 1;
  if (isStr(page) && !isNaN(parseInt(page))) activePageNum = parseInt(page);

  const [category, setCategory] = useState<Category>(DefaultCategory);

  async function fetchCategory() {
    await fetch(`${APIurl}/api/store/categories/${params.category}/`)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      }
      return
    })
    .then(data => {
      data && setCategory({
        id: data.id,
        slug: data.slug,
        image: data.image,
        description: data[`description_${staticData.backendPostfix}` || "description"],
        title: data[`title_${staticData.backendPostfix}` || "title"],
        filters: data.filter
      });
    });
  }

  const { staticData } = useLocalization();
  const [productsWithVariants, setProductsWithVariants] = useState<ProductWithVariant[]>([]);
  const [productsToShow, setProductsToShow] = useState([]);

  function getUniqueSizes(products: ProductWithVariant[]): string[] {
    const sizes = products.flatMap(product => product.product_variants.flatMap(variant => variant.sizes.map(size => size[(`title_${staticData.backendPostfix}` || "title") as keyof Size].toString())));
    return Array.from(new Set(sizes));
  }

  const [filterParams, setFilterParams] = useState<{[key: string]: string}>({
    "category_slug": params.category,
    "size": "",
    "filter_fields_value_en_mul": ""
  });

  const [sort, setSort] = useState<string>("suitable");

  useEffect(() => {
    const newProducts = [...productsToShow].sort(sortings[sort]);
    setProductsToShow(newProducts);
  }, [sort]);

  async function searchFetch() {
    const urlParams = new URLSearchParams(filterParams);

    await fetch(`${APIurl}/api/store/products/?${urlParams}`)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      }
      return
    })
    .then(data => {
      data && setProductsWithVariants(data);
      if (data) {
        let productsToShow = data.map((product:any) => ({
          id: product.id,
          title: product[`title_${staticData.backendPostfix}` || "title"],
          category_slug: product.category.slug,
          category_title: product.category[`title_${staticData.backendPostfix}` || "title"],
          image: product.product_variants[0].main_image,
          price: product.product_variants[0].default_price,
          number_of_views: product.number_of_views,
          date: new Date(product.last_modified)
        }));
        setProductsToShow(productsToShow);
      }
    });
  }

  useEffect(() => {
    fetchCategory();
  }, []);

  useEffect(() => {
    searchFetch();
  }, [filterParams]);

  return (
    <>
      <ProductHeader
        title={category.title}
        description={
          category.description
        }
      />
      <ProductsFilters 
        count={productsWithVariants.length} 
        sort={sort} 
        setSort={setSort} 
        filters={category.filters}
        sizes={getUniqueSizes(productsWithVariants)}
        setFilterParams={setFilterParams}
        filterParams={filterParams}
      />
      <CompareBanner url={GoodsUrl.getBlankets()} />
      <ProductsList
        className={"mt-12"}
        activePage={activePageNum}
        products={productsToShow}
      />
      <PopularGoods />
      <ProductDescriptions descriptions={productDescriptions} />
    </>
  );
}
