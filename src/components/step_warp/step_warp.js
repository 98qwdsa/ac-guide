// components/step_warp/step_warp.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    stepList: {
      type: Array,
      value: []
    },
    curStep: {
      type: Number,
      value: 0
    }
  },
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTap: function(e) {
      let lastStep = e.target.dataset.item._id === [...this.data.stepList].pop()._id
      this.triggerEvent('completeClick', { ...e.target.dataset.item,
        lastStep
      })
    },
    confirmStep(e) {
      let lastStep = e.target.dataset.item._id === [...this.data.stepList].pop()._id
      this.triggerEvent('confirmClick', {
        ...e.target.dataset.item,
        lastStep
      })
    }
  }
})