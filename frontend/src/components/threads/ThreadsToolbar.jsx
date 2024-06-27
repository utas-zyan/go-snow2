import React from "react"
import posting from "../../services/posting"
import Button from "../button"
import { Toolbar, ToolbarItem, ToolbarSection, ToolbarSpacer } from "../Toolbar"
import ThreadsCategoryPicker from "./ThreadsCategoryPicker"
import ThreadsListPicker from "./ThreadsListPicker"
import ThreadsToolbarModeration from "./ThreadsToolbarModeration"

const filterButton = ({
  topCategory, subCategories, list, subCategory
}) => {
  if (topCategory && subCategories.length > 0) {
    return (
      <ToolbarItem>
        <ThreadsCategoryPicker
          allItems={pgettext("threads list nav", "All subcategories")}
          parentUrl={topCategory.url.index}
          category={subCategory}
          categories={subCategories}
          list={list}
        />
      </ToolbarItem>
    )
  } else {
    return null
  }
}

const filterList = ({
  baseUrl, list, lists
}) => {
  if (lists.length > 0) {
    return (
      <ToolbarItem>
        <ThreadsListPicker baseUrl={baseUrl} list={list} lists={lists} />
      </ToolbarItem>
    )
  } else {
    return null
  }
}


const defaultNewThreadButton = ({
  misago, user, category, disabled, startThread
}) => {
    return <ToolbarItem>
      <Button
        className="btn-primary btn-outline btn-block"
        disabled={disabled}
        onClick={() => {
          posting.open(
            startThread || {
              mode: "START",

              config: misago.get("THREAD_EDITOR_API"),
              submit: misago.get("THREADS_API"),

              category: category.id,
            }
          )
        }}
      >
        <span className="material-icon">chat</span>
        {pgettext("threads list nav", "New thread")}
      </Button>
    </ToolbarItem>
}
const defaultNewThreadButtonModeration = ({
  user, category, disabled, api, categories, categoriesMap,
  threads, addThreads, freezeThread, updateThread, deleteThread,
  selection, moderation, route
}) => {
  if (!!user.id && category.id != 2 && !!moderation.allow) {
    return <ToolbarItem shrink>
      <ThreadsToolbarModeration
        api={api}
        categories={categories}
        categoriesMap={categoriesMap}
        threads={threads.filter(
          (thread) => selection.indexOf(thread.id) !== -1
        )}
        addThreads={addThreads}
        freezeThread={freezeThread}
        updateThread={updateThread}
        deleteThread={deleteThread}
        selection={selection}
        moderation={moderation}
        route={route}
        user={user}
        disabled={disabled}
      />
    </ToolbarItem>
  } else {
    return null

  }
}
const ThreadsToolbar = ({
  api,
  baseUrl,
  category,
  categories,
  categoriesMap,
  topCategory,
  topCategories,
  subCategory,
  subCategories,
  list,
  lists,
  threads,
  addThreads,
  startThread,
  freezeThread,
  updateThread,
  deleteThread,
  selection,
  moderation,
  route,
  user,
  disabled,
}) => (
  <Toolbar>
    {topCategories.length > 0 && (
      <div>
        <ToolbarSection>
          <ToolbarItem>
            <ThreadsCategoryPicker
              allItems={pgettext("threads list nav", "Filter by category")}
              parentUrl={list.path}
              category={topCategory}
              categories={topCategories}
              list={list}
            />
          </ToolbarItem>
          {
            filterButton({
              topCategory,
              subCategories,
              list,
              subCategory
            })
          }
          {
            filterList({ baseUrl, list, lists })
          }
        </ToolbarSection>
        <ToolbarSection>
          <ToolbarSpacer />
          {
            defaultNewThreadButton({ misago, user, category, disabled, startThread })
          }
          {
            defaultNewThreadButtonModeration({
              user, category, disabled, api, categories, categoriesMap,
              threads, addThreads, freezeThread, updateThread, deleteThread,
              selection, moderation, route
            })
          }
          {/* {
            newRideThreadButton({ misago, user, category, disabled, startThread })
          }
          {
            newRoomThreadButton({ misago, user, category, disabled, startThread })
          } */}
        </ToolbarSection>
      </div>
    )}
  </Toolbar>
)

export default ThreadsToolbar
