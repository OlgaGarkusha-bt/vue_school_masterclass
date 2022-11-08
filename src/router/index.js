import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/routes/HomePage'
import store from '@/store'
import { findById } from '@/helpers'

const routes = [
  { 
    path: '/',
    name: 'Home',
    component: HomePage 
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/routes/RegisterPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: () => import('@/routes/SignInPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/logout',
    name: 'SignOut',
    async beforeEnter () {
      await store.dispatch('auth/signOut')
      return { name: 'Home' }
    }
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: () => import('@/routes/CategoryPage.vue'),
    props: true
  },
  {
    path: '/forum/:id',
    name: 'Forum',
    component: () => import('@/routes/ForumPage.vue'),
    props: true
  },
  {
    path: '/forum/:forumId/thread/create',
    name: 'ThreadCreate',
    component: () => import('@/routes/ThreadCreate.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/thread/:id/edit',
    name: 'ThreadEdit',
    component: () => import('@/routes/ThreadEditPage.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  { 
    path: '/thread/:id',
    name: 'ThreadShow',
    component: () => import('@/routes/ThreadShowPage.vue'),
    props: true,

    async beforeEnter (to, from, next) {
      await store.dispatch('threads/fetchThread', { id: to.params.id, once: true })
      // check if thread exists
      const threadExists = findById(store.state.threads.items, to.params.id)
      // if exists continue
      if (threadExists) {
        return next()
      } else {
        next({
          name: 'NotFound',
          params: { pathMatch: to.path.substring(1).split('/') },
          // preserve existing query and hash
          query: to.query,
          hash: to.hash
        })
      }
      // if doesnt exist redirect to not found
    }
  },
  
  {
    path: '/me',
    name: 'Profile',
    component: () => import('@/routes/ProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/me/edit',
    name: 'ProfileEdit',
    component: () => import('@/routes/ProfilePage.vue'),
    props: { edit: true },
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/routes/NotFound.vue')
  }
]

const router = createRouter( 
  {
    history: createWebHistory(),
    routes,
    scrollBehavior () {
      return { 
        top: 0,
        behavior: 'smooth'
      }
    }
  }
)

router.beforeEach(async (to, from) => {
  await store.dispatch('auth/initAuthentication')
  console.log(`🚦 navigating to ${to.name} from ${from.name}`)
  store.dispatch('unsubscribeAllSnapshots')
  if (to.meta.requiresAuth && !store.state.auth.authId) {
    return { name: 'SignIn', query: { redirectTo: to.path }}
  }
  if (to.meta.requiresGuest && store.state.auth.authId) {
    return { name: 'Home' }
  }
})

export default router