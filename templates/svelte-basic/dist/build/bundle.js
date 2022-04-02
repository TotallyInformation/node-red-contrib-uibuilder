!function(){function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function s(t,e){t.appendChild(e)}function a(t,e,n){t.insertBefore(e,n||null)}function u(t){t.parentNode.removeChild(t)}function c(t){return document.createElement(t)}function l(t){return document.createTextNode(t)}function d(){return l(" ")}function f(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function g(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}let p;function h(t){p=t}function m(t){(function(){if(!p)throw new Error("Function called outside component initialization");return p})().$$.on_mount.push(t)}const b=[],$=[],y=[],v=[],_=Promise.resolve();let k=!1;function x(t){y.push(t)}const w=new Set;let E=0;function M(){const t=p;do{for(;E<b.length;){const t=b[E];E++,h(t),z(t.$$)}for(h(null),b.length=0,E=0;$.length;)$.pop()();for(let t=0;t<y.length;t+=1){const e=y[t];w.has(e)||(w.add(e),e())}y.length=0}while(b.length);for(;v.length;)v.pop()();k=!1,w.clear(),h(t)}function z(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(x)}}const A=new Set;function q(t,e){-1===t.$$.dirty[0]&&(b.push(t),k||(k=!0,_.then(M)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function N(i,s,a,c,l,d,f,g=[-1]){const m=p;h(i);const b=i.$$={fragment:null,ctx:null,props:d,update:t,not_equal:l,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(s.context||(m?m.$$.context:[])),callbacks:n(),dirty:g,skip_bound:!1,root:s.target||m.$$.root};f&&f(b.root);let $=!1;if(b.ctx=a?a(i,s.props||{},((t,e,...n)=>{const o=n.length?n[0]:e;return b.ctx&&l(b.ctx[t],b.ctx[t]=o)&&(!b.skip_bound&&b.bound[t]&&b.bound[t](o),$&&q(i,t)),e})):[],b.update(),$=!0,o(b.before_update),b.fragment=!!c&&c(b.ctx),s.target){if(s.hydrate){const t=function(t){return Array.from(t.childNodes)}(s.target);b.fragment&&b.fragment.l(t),t.forEach(u)}else b.fragment&&b.fragment.c();s.intro&&((y=i.$$.fragment)&&y.i&&(A.delete(y),y.i(v))),function(t,n,i,s){const{fragment:a,on_mount:u,on_destroy:c,after_update:l}=t.$$;a&&a.m(n,i),s||x((()=>{const n=u.map(e).filter(r);c?c.push(...n):o(n),t.$$.on_mount=[]})),l.forEach(x)}(i,s.target,s.anchor,s.customElement),M()}var y,v;h(m)}function P(e){let n,o,i,p,h,m,b,$,y,v,_,k,x,w,E;return{c(){n=c("main"),o=c("h1"),o.textContent="Svelte + uibuilder",i=d(),p=c("p"),h=l(e[2]),m=d(),b=c("p"),$=l(e[3]),y=d(),v=c("button"),_=l("Click Me"),k=d(),x=c("pre"),f(o,"class","svelte-1qdwzbk"),f(p,"title","A dynamic greeting that can be update using a msg from Node-RED"),f(p,"class","svelte-1qdwzbk"),f(b,"title","Some other dynamic property that main.js might update"),f(b,"class","svelte-1qdwzbk"),f(v,"data-greeting",e[2]),f(v,"data-something","this is something"),f(v,"title","Uses the uibsend fn and sents both static and dynamic data back to Node-RED"),f(n,"class","svelte-1qdwzbk"),f(x,"id","msg"),f(x,"class","syntax-highlight svelte-1qdwzbk"),f(x,"title","Uses @html because nrMsg contains html highlights")},m(t,u){var c,l,d,f;a(t,n,u),s(n,o),s(n,i),s(n,p),s(p,h),s(n,m),s(n,b),s(b,$),s(n,y),s(n,v),s(v,_),a(t,k,u),a(t,x,u),x.innerHTML=e[1],w||(l="click",d=function(){r(e[0])&&e[0].apply(this,arguments)},(c=v).addEventListener(l,d,f),E=()=>c.removeEventListener(l,d,f),w=!0)},p(t,[n]){e=t,4&n&&g(h,e[2]),8&n&&g($,e[3]),4&n&&f(v,"data-greeting",e[2]),2&n&&(x.innerHTML=e[1])},i:t,o:t,d(t){t&&u(n),t&&u(k),t&&u(x),w=!1,E()}}}function S(t,e,n){let{uibsend:o}=e,{nrMsg:r=""}=e,{myGreeting:i="Hello there from App.svelte!"}=e,{anotherProp:s="--"}=e;return m((()=>{uibuilder.start(),n(0,o=uibuilder.eventSend),uibuilder.onChange("msg",(t=>{var e;n(1,(e=t,r=(e=(e=JSON.stringify(e,void 0,4)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")).replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,(t=>{var e="number";return/^"/.test(t)?e=/:$/.test(t)?"key":"string":/true|false/.test(t)?e="boolean":/null/.test(t)&&(e="null"),'<span class="'+e+'">'+t+"</span>"})))),t.greeting&&n(2,i=t.greeting)}))})),t.$$set=t=>{"uibsend"in t&&n(0,o=t.uibsend),"nrMsg"in t&&n(1,r=t.nrMsg),"myGreeting"in t&&n(2,i=t.myGreeting),"anotherProp"in t&&n(3,s=t.anotherProp)},[o,r,i,s]}new class extends class{$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}{constructor(t){super(),N(this,t,S,P,i,{uibsend:0,nrMsg:1,myGreeting:2,anotherProp:3})}}({target:document.body,props:{anotherProp:"I am from a prop set in main.js"}})}();
//# sourceMappingURL=bundle.js.map