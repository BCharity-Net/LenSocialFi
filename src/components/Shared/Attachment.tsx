import { Spinner } from '@components/UI/Spinner'
import { Tooltip } from '@components/UI/Tooltip'
import { BCharityAttachment } from '@generated/bcharitytypes'
import { PhotographIcon } from '@heroicons/react/outline'
import uploadAssetsToIPFS from '@lib/uploadAssetsToIPFS'
import { motion } from 'framer-motion'
import { ChangeEvent, Dispatch, FC, useId, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface Props {
  attachments: BCharityAttachment[]
  setAttachments: Dispatch<BCharityAttachment[]>
}

const Attachment: FC<Props> = ({ attachments, setAttachments }) => {
  const { t } = useTranslation('common')
  const [loading, setLoading] = useState<boolean>(false)
  const id = useId()

  const hasVideos = (files: any) => {
    let videos = 0
    let images = 0

    for (let i = 0; i < files.length; i++) {
      if (files[i].type === 'video/mp4') {
        videos = videos + 1
      } else {
        images = images + 1
      }
    }

    if (videos > 0) {
      if (videos > 1) {
        return true
      }

      return images > 0 ? true : false
    } else {
      return false
    }
  }

  const handleAttachment = async (evt: ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault()
    setLoading(true)

    try {
      if (
        evt.target.files &&
        (hasVideos(evt.target.files) || evt.target.files.length > 4)
      ) {
        toast.error('Please choose either 1 video or up to 4 photos.')
      } else {
        const attachment = await uploadAssetsToIPFS(evt.target.files)
        if (attachment) {
          setAttachments(attachment)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="button"
        aria-label={t('Choose attachment')}
      >
        <label className="flex gap-1 items-center cursor-pointer" htmlFor={id}>
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <Tooltip placement="top" content="Media">
              <PhotographIcon className="w-5 h-5 text-brand" />
            </Tooltip>
          )}
          <input
            id={id}
            type="file"
            multiple
            accept="image/*, video/*"
            className="hidden"
            onChange={handleAttachment}
            disabled={attachments.length >= 4}
          />
        </label>
      </motion.button>
    </div>
  )
}

export default Attachment
