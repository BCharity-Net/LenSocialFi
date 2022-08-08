import Slug from '@components/Shared/Slug'
import { Mirror } from '@generated/types'
import { SwitchHorizontalIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  publication: Mirror
}

const Mirrored: FC<Props> = ({ publication }) => {
  const { t } = useTranslation('common')
  const publicationType = publication?.metadata?.attributes[0]?.value

  return (
    <div className="flex items-center pb-4 space-x-1 text-gray-500 text-[13px]">
      <SwitchHorizontalIcon className="w-4 h-4" />
      <div className="flex items-center space-x-1">
        <Link href={`/u/${publication?.profile?.handle}`}>
          <a className="max-w-xs truncate" href={`/u/${publication?.profile?.handle}`}>
            {publication?.profile?.name ? (
              <b>{publication?.profile?.name}</b>
            ) : (
              <Slug slug={publication?.profile?.handle} prefix="@" />
            )}
          </a>
        </Link>
        <Link href={`/posts/${publication?.mirrorOf?.id}`}>
          <a href={`/posts/${publication?.mirrorOf?.id}`}>
            <span>{t('Mirrored')} </span>
            <b>
              {publication?.mirrorOf.__typename === 'Post'
                ? publicationType === 'fundraise'
                  ? 'fundraise'
                  : publication?.mirrorOf.__typename?.toLowerCase()
                : publication?.mirrorOf.__typename?.toLowerCase()}
            </b>
          </a>
        </Link>
      </div>
    </div>
  )
}

export default Mirrored
