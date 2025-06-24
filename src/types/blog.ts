// Backwards compatibility layer - re-export magazine types as blog types
export {
  MagazineArticle as BlogPost,
  MagazineCategory as BlogCategory,
  MagazineTag as BlogTag,
  MagazineComment as BlogComment,
  CreateMagazineArticleData as CreateBlogPostData,
  UpdateMagazineArticleData as UpdateBlogPostData,
  MagazineListFilters as BlogListFilters,
  MagazineStats as BlogStats
} from './magazine';