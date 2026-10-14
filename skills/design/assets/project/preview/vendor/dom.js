/* Minimal DOM factory for the desktop preview components. */
(function(){
  const svgTags=new Set(['svg','path','circle','rect','line','polyline','polygon','g','ellipse','defs','clipPath']);
  const unitless=new Set(['opacity','zIndex','fontWeight','lineHeight','flex','flexGrow','flexShrink','order','scale']);
  function append(el,value){if(Array.isArray(value))value.forEach(child=>append(el,child));else if(value!==null&&value!==undefined&&value!==false&&value!==true)el.append(value instanceof Node?value:document.createTextNode(String(value)));}
  function h(tag,props,...children){
    const p=props||{},flat=children.flat(Infinity);if(typeof tag==='function')return tag({...p,children:flat});
    const isSvg=svgTags.has(tag),el=isSvg?document.createElementNS('http://www.w3.org/2000/svg',tag):document.createElement(tag);
    for(const[name,value]of Object.entries(p)){
      if(name==='key'||name==='children'||value===null||value===undefined||value===false)continue;
      if(name==='style'){for(const[key,v]of Object.entries(value)){if(v===null||v===undefined)continue;el.style[key]=typeof v==='number'&&!unitless.has(key)&&v!==0?v+'px':String(v);}continue;}
      if(/^on[A-Z]/.test(name)){el.addEventListener(name.slice(2).toLowerCase(),value);continue;}
      const attribute=name==='className'?'class':isSvg&&!['viewBox','preserveAspectRatio','gradientUnits','clipPathUnits'].includes(name)?name.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()):name;el.setAttribute(attribute,value===true?'':String(value));
    }
    flat.forEach(child=>append(el,child));return el;
  }
  window.PreviewDOM={h};
})();
