import type { ImageOptions as TiptapImageOptions } from '@tiptap/extension-image'
import { Image as TiptapImage } from '@tiptap/extension-image'
import { VueNodeViewRenderer } from '@tiptap/vue-3'

import ImageView from './components/image/ImageView.vue'
import type { ImageAttrsOptions, ImageTab, ImageTabKey } from './components/image/types'
import ImageActionButton from './components/ImageActionButton.vue'

import { IMAGE_SIZE } from '@/constants/define'
import type { ButtonView, GeneralOptions } from '@/type'

type Upload = (file: File) => Promise<string>
export interface ImageOptions extends TiptapImageOptions, GeneralOptions {
  upload?: Upload
  imageTabs: ImageTab[]
  hiddenTabs: ImageTabKey[]
  button: ButtonView<ImageOptions>
}

interface SetImageAttrsOptions extends ImageAttrsOptions {
  src: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageResize: {
      /**
       * Add an image
       */
      setImage: (options: Partial<SetImageAttrsOptions>) => ReturnType
      /**
       * Update an image
       */
      updateImage: (options: Partial<SetImageAttrsOptions>) => ReturnType
    }
  }
}

export const Image = /* @__PURE__*/ TiptapImage.extend<ImageOptions>({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null
      },
      alt: {
        default: null
      },
      lockAspectRatio: {
        default: true
      },
      width: {
        default: IMAGE_SIZE['size-large']
      },
      height: {
        default: null
      },
      display: {
        default: 'inline',
        renderHTML: ({ display }) => {
          if (!display) {
            return {}
          }

          return {
            'data-display': display
          }
        },
        parseHTML: element => {
          const display = element.getAttribute('data-display')
          return display || 'inline'
        }
      }
    }
  },
  addNodeView() {
    return VueNodeViewRenderer(ImageView)
  },
  addCommands() {
    return {
      ...this.parent?.(),
      updateImage:
        options =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, options)
        }
    }
  },
  addOptions() {
    return {
      ...this.parent?.(),
      upload: undefined,
      imageTabs: [],
      hiddenTabs: [],
      inline: true,
      button: ({ editor, extension, t }) => {
        const { upload, imageTabs, hiddenTabs } = extension.options

        return {
          component: ImageActionButton,
          componentProps: {
            editor,
            upload,
            imageTabs,
            hiddenTabs,
            isActive: () => editor.isActive('image') || false,
            icon: 'image',
            tooltip: t('editor.image.tooltip')
          }
        }
      }
    }
  }
})
