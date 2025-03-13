const sheetData = require('../../datas/sheetData.js')
const tableData = require('../../datas/tableData.js')

// Combine and deduplicate the data based on name and manufacturer
const medicineData = [...sheetData, ...tableData].reduce((unique, item) => {
  // Create a unique key combining name and manufacturer
  const key = `${item.name}-${item.manufacturer}`
  
  // Check if we already have this combination
  const exists = unique.find(u => 
    `${u.name}-${u.manufacturer}` === key
  )
  
  // Only add if it doesn't exist yet
  if (!exists) {
    unique.push(item)
  }
  
  return unique
}, [])

// Log the deduplication results
console.log('Original records:', sheetData.length + tableData.length)
console.log('After deduplication:', medicineData.length)

Page({
  data: {
    searchValue: '',
    searchResults: [],
    defaultResults: [],
    pageSize: 20,
    currentPage: 1,
    hasMore: true,
    allSearchResults: []
  },

  onLoad() {
    // Initialize with first 20 records
    const initialRecords = medicineData.slice(0, this.data.pageSize)
    this.setData({
      defaultResults: initialRecords,
      hasMore: medicineData.length > this.data.pageSize
    })
    console.log('Loaded initial records:', initialRecords.length)
    console.log('Total records available:', medicineData.length)
  },

  onShow() {
    // Page show logic
  },

  onSearch(e) {
    const searchValue = e.detail.value.toLowerCase()
    
    if (!searchValue) {
      // Reset to default view
      this.setData({ 
        searchValue: '',
        currentPage: 1,
        searchResults: [],
        hasMore: medicineData.length > this.data.pageSize
      })
      return
    }

    // Filter all matching results based on name or brandName
    const allResults = medicineData.filter(item => {
      return (item.name && item.name.toLowerCase().includes(searchValue)) || 
             (item.brandName && item.brandName.toLowerCase().includes(searchValue))
    })

    // Only show first page of search results
    const firstPageResults = allResults.slice(0, this.data.pageSize)
    
    this.setData({ 
      searchValue,
      currentPage: 1,
      searchResults: firstPageResults,
      allSearchResults: allResults,
      hasMore: allResults.length > this.data.pageSize
    })
    
    console.log('Search results (first page):', firstPageResults.length)
    console.log('Total search results:', allResults.length)
  },

  // Handle scroll to bottom
  onScrollToLower() {
    // console.log('Scrolled to bottom, loading more...')
    if (!this.data.hasMore) {
      console.log('No more data to load')
      return
    }
    
    const { currentPage, pageSize, searchValue } = this.data
    const nextPage = currentPage + 1
    const start = currentPage * pageSize
    const end = nextPage * pageSize
    
    // console.log(`Loading page ${nextPage}, items ${start} to ${end}`)
    
    if (searchValue) {
      // When searching, load more from allSearchResults
      const allResults = this.data.allSearchResults
      const moreResults = allResults.slice(start, end)
      
      if (moreResults.length === 0) {
        this.setData({ hasMore: false })
        console.log('No more search results')
        return
      }
      
      const newResults = [...this.data.searchResults, ...moreResults]
      console.log(`Adding ${moreResults.length} more search results`)
      
      this.setData({
        searchResults: newResults,
        currentPage: nextPage,
        hasMore: end < allResults.length
      })
    } else {
      // When showing default list, load more from medicineData
      const moreResults = medicineData.slice(start, end)
      
      if (moreResults.length === 0) {
        this.setData({ hasMore: false })
        console.log('No more default results')
        return
      }
      
      const newResults = [...this.data.defaultResults, ...moreResults]
    //   console.log(`Adding ${moreResults.length} more default results`)
      
      this.setData({
        defaultResults: newResults,
        currentPage: nextPage,
        hasMore: end < medicineData.length
      })
    }
  },

  onShare() {
    if (wx.canIUse('shareToWeRun')) {
      const { searchResults, searchValue } = this.data;
      
      // Format the search results into a shareable message
      let shareContent = searchValue ? `Search results for "${searchValue}":\n\n` : 'Medicine List:\n\n';
      
      const resultsToShare = searchValue ? searchResults : this.data.defaultResults;
      resultsToShare.forEach((item, index) => {
        shareContent += `${index + 1}. ${item.name}\n`;
      });

      // Show the native WeChat sharing sheet
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline'],
        success: function() {
          console.log('Share menu shown successfully');
        },
        fail: function(err) {
          console.error('Failed to show share menu:', err);
          // Fallback to clipboard if sharing fails
          wx.setClipboardData({
            data: shareContent,
            success: function() {
              wx.showToast({
                title: '已复制到剪贴板',
                icon: 'success'
              });
            }
          });
        }
      });
    } else {
      wx.showToast({
        title: '当前版本不支持分享功能',
        icon: 'none'
      });
    }
  },

  onShareAppMessage: function() {
    const { searchResults, searchValue } = this.data;
    const resultsToShare = searchValue ? searchResults : this.data.defaultResults;
    
    let title = searchValue 
      ? `搜索结果: ${searchValue}`
      : '药品清单';

    // Limit the title length
    if (title.length > 30) {
      title = title.substring(0, 27) + '...';
    }

    return {
      title: title,
      path: '/pages/search/search?searchValue=' + encodeURIComponent(searchValue),
      success: function(res) {
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        });
      },
      fail: function(res) {
        wx.showToast({
          title: '分享失败',
          icon: 'none'
        });
      }
    };
  },

  clearSearch() {
    this.setData({ 
      searchValue: '',
      currentPage: 1,
      searchResults: [],
      hasMore: medicineData.length > this.data.pageSize
    })
  },
}) 