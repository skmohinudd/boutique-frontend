import { useQuery } from "@tanstack/react-query";import { getCategories,getProductById,getProducts } from "../../api/productApi";
export const productQueryKeys={all:["products"],list:(filters)=>["products","list",filters],details:()=>["products","detail"],detail:(id)=>["products","detail",id],categories:["products","categories"]};
export function useProducts(filters){return useQuery({queryKey:productQueryKeys.list(filters),queryFn:()=>getProducts(filters),placeholderData:(previous)=>previous});}
export function useProduct(id){return useQuery({queryKey:productQueryKeys.detail(id),queryFn:()=>getProductById(id),enabled:Boolean(id)});}
export function useProductCategories(){return useQuery({queryKey:productQueryKeys.categories,queryFn:getCategories,staleTime:300000});}
