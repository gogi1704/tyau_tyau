import { Link } from "react-router-dom";
import DogAvatar from "./DogAvatar";
import type { Post } from "../lib/types";

const formatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-soft dark:bg-ink-800">
      <div className="flex items-center gap-2.5 p-3.5">
        <Link to={`/dog/${post.dog.id}`}>
          <DogAvatar photoUrl={post.dog.photoUrl} size={36} />
        </Link>
        <div className="flex-1">
          <Link to={`/dog/${post.dog.id}`} className="text-sm font-semibold text-ink-900 dark:text-white">
            {post.dog.name}
          </Link>
          {post.group && (
            <>
              {" "}
              <span className="text-xs text-ink-400">в </span>
              <Link to={`/groups/${post.group.id}`} className="text-xs font-medium text-forest-700 dark:text-forest-300">
                {post.group.name}
              </Link>
            </>
          )}
          <p className="text-xs text-ink-400">{formatter.format(new Date(post.createdAt))}</p>
        </div>
      </div>

      {post.photoUrl && <img src={post.photoUrl} alt="" className="max-h-80 w-full object-cover" />}

      {post.caption && <p className="px-3.5 pb-3.5 pt-2 text-sm text-ink-700 dark:text-ink-200">{post.caption}</p>}
    </div>
  );
}
