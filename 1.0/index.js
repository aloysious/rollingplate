/**
 * @brief 抽奖转盘组件 
 *
 */
KISSY.add("gallery/rollingplate/1.0/index", function (S, BASE, EVENT, DOM, NODE, Anim) {

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
		
		// 转盘以相对标准xy坐标系y轴正方向的顺时初始偏移角度，默认为0
		rotateOffset: {
			value: 0
		},

		// 旋转的目标('plate'|'pointer')
		rotateTarget: {
			value: 'plate'
		},

		// 旋转的效果
		rotateEffect: {
			value: 'ease-in'
		},

		// 旋转持续时间，秒为单位
		rotateDuration: {
			value: 3
		},

		// 旋转的最小圈数
		rotateRound: {
			value: 5
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
			value: null
		},

		// 抽奖转盘转动前的自定义校验函数，如果没有定义函数，则转盘直接转动，
		// 否则由用户在自定义函数体中控制转动的开始时机
		// TODO：这样合理吗？！
		customBeforeRollFn: {
			value: null
		}
	};

	S.extend(Rollingplate, S.Base, {}, {
		ROLLING_PLATE_TEMPLATE: '<div class="ks-rollingplate-wrap"><div class="ks-rollingplate-plate"></div><div class="ks-rollingplate-pointer"></div></div>'
	});

	S.augment(Rollingplate, S.Event.Target, {

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
			this.plateNode = this.con.one('.ks-rollingplate-plate');
			this.pointerNode = this.con.one('.ks-rollingplate-pointer');
			this.rotateTargetNode = this.con.one('.ks-rollingplate-' + this.get('rotateTarget'));
		},

		_bindUI: function() {
			var self = this;

			EVENT.on(self.pointerNode, 'click', self._beforeRolling, self);

			self.on('afterRoll', function(e) {
				self.rotateTargetAngle = e.toAngle;
				self.isRolling = false;
			});
		},

		_beforeRolling: function() {

			if (this.isRolling === true) {
				return;
			}

			this.isRolling = true;

			// 如果在抽奖前定义了校验函数，则把转盘转动的控制权交给用户
			if (S.isFunction(this.get('customBeforeRollFn'))) {
				this.get('customBeforeRollFn')();
			
			// 否则，进行抽奖
			} else {
				this._startRolling();
			}
		},

		_startRolling: function() {
			var self = this;

			// 如果直接在前端执行抽奖
			if (self.get('lotteryUrl') === null) {
				var awardIndex = self._feLottery();
				self._rollTo(awardIndex);
					
			// 否则，调用后端接口返回抽奖结果
			} else {
			
			}
		},

	   /**
		* @brief 在前端执行抽奖
		*
		* @return int 中奖奖品index
		*/
		_feLottery: function() {
			var totalRate = 0,
				awardList = this.get('awardList');
			S.each(awardList, function(award) {
				var awardRate = awardRate;
				if (awardRate < 0 || awardRate > 1) {
					throw new Error('Lottery rates are set wrong.');
				}
				totalRate += award.awardRate;
			});
			// 如果中奖概率总数不等于1，报错
			if (totalRate !== 1) {
				throw new Error('Lottery rates are set wrong.');
			}

			var rate = Math.random();
			for(var i=0, length=awardList.length; i<length; i++) {
				awardList[i].minRate = awardList[i-1] ? awardList[i-1].maxRate : 0;
				awardList[i].maxRate = awardList[i].minRate + awardList[i].awardRate;

				if (rate >= awardList[i].minRate && rate < awardList[i].maxRate) {
					return i;
				}
			}
			
			throw new Error('Award is not found.');
		},

		/**
		 * @brief 转盘旋转到中奖奖品处 
		 *
		 * @param index {int} 中奖奖品index
		 * @param doAnim {boolean} 是否执行旋转动画 
		 *
		 */
		_rollTo: function(index, doAnim) {
			var self = this,
				rotateTargetAngle = self.rotateTargetAngle;

			// 重置旋转目标体的角度至小于360度的同等位置
			while (rotateTargetAngle >= 360) {
				rotateTargetAngle -= 360;
			}
			DOM.css(self.rotateTargetNode, {
				'-webkit-transition': '',
				'-webkit-transform': 'rotate(' + rotateTargetAngle + 'deg)'
			});

			var toAngle,
				tmpIndex = self.get('rotateTarget') === 'plate' ? (self.get('awardList').length - index) : index;
			toAngle = (360 / self.get('awardList').length) * tmpIndex + 360 * self.get('rotateRound') + self.get('rotateOffset');
			self.rotateTargetAngle = toAngle;

			setTimeout(function() {
				// 如果doAnim不为false，执行动画，否则不执行
				if (doAnim !== false) {
					DOM.css(self.rotateTargetNode, {
						'-webkit-transition': '-webkit-transform ' + self.get('rotateDuration') + 's ' + self.get('rotateEffect')
					});
				}
				DOM.css(self.rotateTargetNode, {
					'-webkit-transform': 'rotate(' + toAngle + 'deg)'
				});
			}, 0);

			setTimeout(function() {
				self.fire('afterRoll', {
					toAngle: toAngle,
					index: index
				});
			}, self.get('rotateDuration') * 1000);
		},

		/**
		 * @brief 获取旋转目标体当前的旋转角度
		 *
		 * @return int 旋转的角度
		 */
		_getRotateTargetAngle: function() {
			var tmpArr = DOM.css(this.rotateTargetNode, '-webkit-transform').match(/-?[0|1]\.?\d*/ig),
				currDeg = Math.acos(tmpArr[0]) * 180 / Math.PI;

			return currDeg;
		},

		_syncUI: function() {
			this._syncUIPosition();
			this._syncUIRotateOffset();
			this._syncDefaultIndex();
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
		_syncUIRotateOffset: function() {
			DOM.css(this.plateNode, {
				'-webkit-transform': 'rotate(' + this.get('rotateOffset') + 'deg)'
			});
			DOM.css(this.pointerNode, {
				'-webkit-transform': 'rotate(' + this.get('rotateOffset') + 'deg)'
			});

			this.rotateTargetAngle = this.get('rotateOffset');
		},

		/**
		 * @brief 同步默认选中的奖品
		 *
		 */
		_syncDefaultIndex: function() {
			this._rollTo(this.get('defaultIndex'), false);	
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

	});

	return Rollingplate;

}, {
	requires: ['base', 'event','dom', 'node', 'anim', './assets/rollingplate-skin.css']
});
