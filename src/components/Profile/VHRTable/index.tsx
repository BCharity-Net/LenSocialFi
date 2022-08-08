/* eslint-disable react/jsx-key */
import { DocumentNode, useQuery } from '@apollo/client'
import PostsShimmer from '@components/Shared/Shimmer/PublicationsShimmer'
import { Card } from '@components/UI/Card'
import { EmptyState } from '@components/UI/EmptyState'
import { ErrorMessage } from '@components/UI/ErrorMessage'
import { Profile } from '@generated/types'
import { CollectionIcon } from '@heroicons/react/outline'
import { ethers } from 'ethers'
import React, { FC, useState } from 'react'
import { Row, useFilters, useTable } from 'react-table'
import { useAppPersistStore } from 'src/store/app'

import NFTDetails from './NFTDetails'
import VHRToken from './VHRToken'

interface Props {
  profile: Profile
  handleQueryComplete: Function
  getColumns: Function
  query: DocumentNode
  request: any
  tableLimit: number
  from: boolean
}

export interface Data {
  orgName: string
  program: string
  city: string
  category: string
  startDate: string
  endDate: string
  totalHours: {
    index: number
    value: number
  }
  verified: {
    index: number
    value: string
    postID: string
  }
}

const VHRTable: FC<Props> = ({
  profile,
  handleQueryComplete,
  getColumns,
  query,
  request,
  tableLimit,
  from
}) => {
  const currentUser = useAppPersistStore((state) => state.currentUser)
  const [onEnter, setOnEnter] = useState<boolean>(false)
  const [tableData, setTableData] = useState<Data[]>([])
  const [pubIdData, setPubIdData] = useState<string[]>([])
  const [vhrTxnData, setVhrTxnData] = useState<string[]>([])
  const [addressData, setAddressData] = useState<string[]>([])

  const handleTableData = async (data: any) => {
    return Promise.all(
      data.map(async (i: any, index: number) => {
        let verified = false
        if (i.collectNftAddress) verified = true
        return {
          orgName: from ? i.profile.handle : i.metadata.name,
          program: i.metadata.attributes[5].value,
          city: i.metadata.attributes[6].value,
          category: i.metadata.attributes[7].value,
          startDate: i.metadata.attributes[2].value,
          endDate: i.metadata.attributes[3].value,
          totalHours: {
            index: index,
            value: i.metadata.attributes[4].value
          },
          verified: {
            index: index,
            value: verified ? 'Verified' : 'Unverified',
            postID: i.id
          }
        }
      })
    )
  }

  const handleNFTData = (data: any, index: number, id: string, name = '') =>
    fetch(data)
      .then((i) => i)
      .then((result) => {
        result.json().then((metadata) => {
          tableData[index] = {
            orgName: from ? name : metadata.name,
            program: metadata.attributes[5].value,
            city: metadata.attributes[6].value,
            category: metadata.attributes[7].value,
            startDate: metadata.attributes[2].value,
            endDate: metadata.attributes[3].value,
            totalHours: {
              index: index,
              value: metadata.attributes[4].value
            },
            verified: {
              index: index,
              value: 'Verified',
              postID: id
            }
          }
          setTableData(tableData)
        })
      })

  const { data, loading, error, fetchMore } = useQuery(query, {
    variables: {
      request: request,
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    skip: !profile?.id,
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      if (onEnter) {
        tableData.splice(0, tableData.length)
        setTableData(tableData)
        setOnEnter(false)
      }
      const hours = handleQueryComplete(data)
      handleTableData(hours).then((result: Data[]) => {
        setTableData([...tableData, ...result])
        if (tableData.length != tableLimit) {
          fetchMore({
            variables: {
              offset: tableLimit - tableData.length
            }
          })
        }
      })
      const pubId: string[] = [],
        vhrTxn: string[] = [],
        addresses: string[] = []
      hours.map((i: any) => {
        pubId.push(i.id)
        vhrTxn.push('')
        addresses.push(i.collectNftAddress)
      })
      setPubIdData([...pubIdData, ...pubId])
      setVhrTxnData([...vhrTxnData, ...vhrTxn])
      setAddressData([...addressData, ...addresses])
      setOnEnter(true)
    }
  })

  const columns = getColumns(addressData)

  const computeHours = (rows: Row<Data>[]) => {
    let result = 0
    rows.forEach((row) => {
      result += row.values.totalHours.value * 1
    })
    return result
  }

  const Table = () => {
    const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } =
      useTable(
        {
          columns,
          data: tableData
        },
        useFilters
      )

    return (
      <table
        className="w-full text-md text-center mb-2 mt-2"
        {...getTableProps()}
      >
        <thead>
          {headerGroups.map((headerGroup, index) => {
            return index === 0 ? (
              <tr>
                <th
                  className="p-4"
                  {...headerGroup.headers[0].getHeaderProps()}
                >
                  {headerGroup.headers[0] &&
                    headerGroup.headers[0].render('Header')}
                  <p>Total Hours: {computeHours(rows)}</p>
                </th>
              </tr>
            ) : (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th className="p-4" {...column.getHeaderProps()}>
                    {column.render('Header')}
                    <div>
                      {column.canFilter ? column.render('Filter') : null}
                    </div>
                  </th>
                ))}
              </tr>
            )
          })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row)
            return (
              <>
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td className="p-4" {...cell.getCellProps()}>
                        {cell.render('Cell', { vhr: vhrTxnData })}
                      </td>
                    )
                  })}
                </tr>
                <VHRToken
                  pubId={pubIdData[index]}
                  callback={(data: any) => {
                    const publications = data.publications.items.filter(
                      (i: any) => ethers.utils.isHexString(i.metadata.content)
                    )
                    if (publications.length !== 0) {
                      if (
                        vhrTxnData[index] != publications[0].metadata.content
                      ) {
                        vhrTxnData[index] = publications[0].metadata.content
                        setVhrTxnData(vhrTxnData)
                        setTableData([...tableData])
                      }
                    }
                  }}
                />
                <NFTDetails
                  address={addressData[index]}
                  callback={(data: any) => {
                    handleNFTData(
                      data,
                      index,
                      tableData[index].verified.postID,
                      tableData[index].orgName
                    )
                  }}
                />
              </>
            )
          })}
        </tbody>
      </table>
    )
  }

  return (
    <>
      {loading && <PostsShimmer />}
      {data?.publications?.items?.length === 0 && (
        <EmptyState
          message={
            <div>
              <span className="mr-1 font-bold">@{profile?.handle}</span>
              <span>seems like not {'POST'.toLowerCase()}ed yet!</span>
            </div>
          }
          icon={<CollectionIcon className="w-8 h-8 text-brand" />}
        />
      )}
      <ErrorMessage title="Failed to load hours" error={error} />
      {!error && !loading && data?.publications?.items?.length !== 0 && (
        <Card>
          <Table />
        </Card>
      )}
    </>
  )
}

export default VHRTable
