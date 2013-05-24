/**
 * @brief 抽奖转盘组件 
 *
 */
KISSY.add("gallery/rollingplate/1.0/index", function (S, BASE, EVENT, DOM, NODE) {

	"use strict";

	function Rollingplate(selector, cfg) {
		if (this instanceof Rollingplate) {
			if(S.isObject(selector)){
				this.con = selector;
			}else if(/^#/i.test(selector)){
				this.con = S.one(selector);
			}else if(S.one("#"+selector)){
				this.con = S.one("#"+selector);
			}else if(S.one(selector)){
				this.con = S.one(selector);
			}else {
				throw new Error('Rollingplate Container Hooker not found');
			}

			Rollingplate.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new Rollingplate(selector, cfg);
		}
	}

	Rollingplate.ATTRS = {
		
		// 转盘以相对标准xy坐标系y轴正方向的顺时针偏移角度，默认为0
		rotateOffset: {
			value: 0
		},

		// 旋转的目标('plate'|'pointer')
		rotateTarget: {
			value: 'plate'
		},

		// 旋转的效果
		rotateEffect: {
			value: 'easeIn'
		},

		// 默认选中的奖品序号，默认为0
		defaultIndex: {
			value: 0
		},

		// 奖品集合
		awardList: {
			value: []
		},

		// 抽奖接口url，若为空，则按照awardList中奖品的中奖概率配置进行抽奖
		lotteryUrl: {
			value: ''
		},

		// 抽奖转盘转动前的自定义校验函数，如果没有定义函数，则转盘直接转动，
		// 否则由用户在自定义函数体中控制转动的开始时机
		// TODO：这样合理吗？！
		customBeforeRollFn: {
			value: null
		}
	};

	S.extend(Rollingplate, S.Base, {

		/* -------------- life cycle -------------- */

		init: function() {
			this.render();
		},

		destory: function(){

		},

		render: function() {
			this._renderUI();
			this._bindUI();
			this._syncUI();
		},

		_renderUI: function() {
			this.con.append(Rollingplate.ROLLING_PLATE_TEMPLATE);
			this._buildParams();
		},
		
		/**
		 * @brief 同步全局参数
		 *
		 */
		_buildParams: function() {
			this.plateNode = this.con.one('.ks-rollingplate-plate');
			this.pointerNode = this.con.one('.ks-rollingplate-pointer');
		},

		_bindUI: function() {
			EVENT.on(this.pointerNode, 'click', this._beforeRolling);
		},

		_beforeRolling: function() {

			// 如果在抽奖前定义了校验函数，则把转盘转动的控制权交给用户
			if (S.isFunction(this.get('customBeforeRollFn'))) {
				this.get('customBeforeRollFn')();
			
			// 否则，进行抽奖
			} else {
				this._startRolling();
			}
		},

		_startRolling: function() {
				
		},

		_syncUI: function() {
			this._syncUIParams();
			this._syncUIPosition();
			this._syncUIAngle();
		},

		/**
		 * @brief 同步转盘和指针的相对位置 
		 *
		 */
		_syncUIPosition: function() {
			var plateWidth = this.plateNode.width(),
				plateHeight = this.plateNode.height(),
				pointerWidth = this.pointerNode.width(),
				pointerHeight = this.pointerNode.height();

			DOM.css(this.pointerNode, {
				left: (plateWidth - pointerWidth) / 2 + 'px',
				top: (plateHeight - pointerHeight) / 2 + 'px'
			});
		},

		 /**
		  * @brief 同步转盘的偏移角度
		  *
		  */
		_syncUIAngle: function() {
			DOM.css(this.plateNode, {
				//'-webkit-transition': '-webkit-transform 1s ease-in',
				'-webkit-transform': 'rotate(' + this.get('rotateOffset') + 'deg)',
				'-webkit-transform-origin': '50% 50%'
			});
			DOM.css(this.pointerNode, {
				//'-webkit-transition': '-webkit-transform 1s ease-in',
				'-webkit-transform': 'rotate(' + this.get('rotateOffset') + 'deg)',
				'-webkit-transform-origin': '50% 50%'
			})
		},

		/* ---------------- public functions --------------- */

		/**
		 * @brief 显示转盘 
		 *
		 */
		show: function() {},

		/**
		 * @brief 隐藏转盘 
		 *
		 */
		hide: function() {},

		/**
		 * @brief 开始转动 
		 *
		 * @param isValidate 是否在开始抽奖前进行校验，校验函数用户自定义
		 */
		start: function(isValidate) {
			if (isValidate) {
				this._beforeRolling();
			} else {
				this._startRolling();
			}
		},

		/**
		 * @brief 停止转动 
		 *
		 */
		stop: function() {}

	}, {
		ROLLING_PLATE_TEMPLATE: '<div class="ks-rollingplate-wrap"><div class="ks-rollingplate-plate"></div><div class="ks-rollingplate-pointer"></div></div>'
	});

	return Rollingplate;

}, {
	requires: ['base', 'event','dom', 'node', './assets/rollingplate-skin.css']
});
