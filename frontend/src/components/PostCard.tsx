import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import DogAvatar from "./DogAvatar";
import { pastelBgClass } from "../lib/pastel";
import type { Post } from "../lib/types";

const formatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default function PostCard({ post, onClick }: { post: Post; onClick?: () => void }) {
  const isTextOnly = !post.photoUrl;

  return (
    <div
      onClick={onClick}
      className={`w-full overflow-hidden rounded-3xl shadow-soft ${onClick ? "cursor-pointer active:scale-[0.99] transition-transform" : ""} ${
        isTextOnly ? pastelBgClass(post.id) : "bg-white dark:bg-ink-800"
      }`}
    >
      <div className="flex items-center gap-2.5 p-3.5">
        <Link to={`/dog/${post.dog.id}`} onClick={(e) => e.stopPropagation()}>
          <DogAvatar photoUrl={post.dog.photoUrl} size={36} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to={`/dog/${post.dog.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-semibold text-ink-900 dark:text-white"
          >
            {post.dog.name}
          </Link>
          {post.group && (
            <>
              {" "}
              <span className="text-xs text-ink-400">в </span>
              <Link
                to={`/groups/${post.group.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-medium text-forest-700 dark:text-forest-300"
              >
                {post.group.name}
              </Link>
            </>
          )}
          <p className="text-xs text-ink-400">{formatter.format(new Date(post.createdAt))}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-xs text-ink-400">
          <Eye size={13} /> {post.viewsCount}
        </span>
      </div>

      {post.photoUrl && <img src={post.photoUrl} alt="" className="max-h-96 w-full object-cover" />}

      {post.caption && (
        <p
          className={`px-3.5 pb-3.5 text-sm ${isTextOnly ? "pt-0 text-ink-800 dark:text-ink-100" : "pt-2 text-ink-700 dark:text-ink-200"}`}
        >
          {post.caption}
        </p>
      )}
    </div>
  );
}
