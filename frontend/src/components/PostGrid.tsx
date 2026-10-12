import type { Post } from "../lib/types";

export default function PostGrid({ posts, onSelect }: { posts: Post[]; onSelect: (post: Post) => void }) {
  if (posts.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <button
          key={post.id}
          onClick={() => onSelect(post)}
          className="relative aspect-square overflow-hidden bg-coral-100 dark:bg-ink-800"
        >
          {post.photoUrl ? (
            <img src={post.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center p-2 text-center text-[11px] leading-tight text-coral-700 dark:text-ink-200">
              {post.caption}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
