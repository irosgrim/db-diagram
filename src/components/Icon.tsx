
type IconProps = {
    type: "plus" | "flag" | "delete" | "key" | "primary-key" | "dots" | "edit" | "null" | "color-palette" | "star" | "circle" | "check" | "dots-grid" | "multi-key";
    color?: string;
    height?: string;
    width?: string;
}
export const Icon = ({ type, color = "black", height, width }: IconProps) => {
    return (
        <>
            {
                type === "plus" && (
                    <svg width={width || "16"} height={height || "16"} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.8571 6.28571H9.71429V1.14286C9.71429 0.511786 9.2025 0 8.57143 0H7.42857C6.7975 0 6.28571 0.511786 6.28571 1.14286V6.28571H1.14286C0.511786 6.28571 0 6.7975 0 7.42857V8.57143C0 9.2025 0.511786 9.71429 1.14286 9.71429H6.28571V14.8571C6.28571 15.4882 6.7975 16 7.42857 16H8.57143C9.2025 16 9.71429 15.4882 9.71429 14.8571V9.71429H14.8571C15.4882 9.71429 16 9.2025 16 8.57143V7.42857C16 6.7975 15.4882 6.28571 14.8571 6.28571Z" fill={color} />
                    </svg>

                )
            }
            {
                type === "delete" && (
                    <svg width={width || "15"} height={height || "16"} viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.4642 13.3635V3.58239H14.8931V2.37484H11.1094V1.81132C11.1094 0.805031 10.3044 0 9.29811 0H5.59497C4.58868 0 3.78365 0.805031 3.78365 1.81132V2.37484H0V3.58239H1.42893V13.3836C1.42893 14.8327 2.59623 16 4.04528 16H10.8478C12.2767 15.9799 13.4642 14.8126 13.4642 13.3635ZM4.99119 1.81132C4.99119 1.46918 5.25283 1.20755 5.59497 1.20755H9.27799C9.62013 1.20755 9.88176 1.46918 9.88176 1.81132V2.37484H4.99119V1.81132ZM2.63648 13.3635V3.58239H12.2566V13.3836C12.2566 14.1686 11.6327 14.7925 10.8478 14.7925H4.04528C3.2805 14.7723 2.63648 14.1484 2.63648 13.3635Z" fill={color} />
                        <path d="M8.05032 5.49432H6.84277V12.7195H8.05032V5.49432Z" fill={color} />
                        <path d="M10.2641 5.49432H9.05658V12.7195H10.2641V5.49432Z" fill={color} />
                        <path d="M5.83645 5.49432H4.62891V12.7195H5.83645V5.49432Z" fill={color} />
                    </svg>
                )
            }
            {

                type === "key" && (
                    <svg width={width || "8"} height={height || "16"} viewBox="0 0 8 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.77899 3.89661C7.77667 4.82125 7.44502 5.71482 6.84352 6.41707C6.24202 7.11932 5.41001 7.58432 4.49671 7.72867L4.49671 15.3846C4.49671 15.5478 4.43187 15.7043 4.31646 15.8197C4.20104 15.9352 4.04451 16 3.88128 16C3.71806 16 3.56153 15.9352 3.44611 15.8197C3.3307 15.7043 3.26586 15.5478 3.26586 15.3846L3.26586 15.1794L1.41958 15.1794C1.25636 15.1794 1.09982 15.1146 0.984408 14.9992C0.868993 14.8838 0.804153 14.7272 0.804153 14.564C0.804153 14.4008 0.868993 14.2442 0.984408 14.1288C1.09982 14.0134 1.25636 13.9486 1.41958 13.9486L3.26586 13.9486L3.26586 12.7177L2.24015 12.7177C2.07693 12.7177 1.92039 12.6529 1.80498 12.5375C1.68956 12.4221 1.62472 12.2655 1.62472 12.1023C1.62472 11.9391 1.68956 11.7825 1.80498 11.6671C1.92039 11.5517 2.07693 11.4869 2.24015 11.4869L3.26586 11.4869L3.26586 7.72867C2.53255 7.60955 1.8487 7.28291 1.29518 6.78738C0.741669 6.29184 0.34165 5.64815 0.142441 4.93244C-0.0567687 4.21673 -0.046834 3.45893 0.171068 2.74869C0.38897 2.03844 0.805723 1.40546 1.37204 0.924608C1.93835 0.443756 2.63053 0.135152 3.36671 0.0352966C4.10289 -0.0645592 4.85227 0.0485111 5.52621 0.361134C6.20015 0.673757 6.77046 1.17285 7.16968 1.79939C7.56891 2.42593 7.78035 3.1537 7.77899 3.89661ZM1.21444 3.89661C1.21444 4.42407 1.37085 4.93967 1.66388 5.37824C1.95692 5.8168 2.37342 6.15861 2.86073 6.36046C3.34803 6.56231 3.88424 6.61512 4.40156 6.51222C4.91888 6.40932 5.39407 6.15533 5.76703 5.78236C6.14 5.40939 6.39399 4.93421 6.49689 4.41689C6.59979 3.89957 6.54698 3.36336 6.34513 2.87606C6.14328 2.38875 5.80147 1.97225 5.36291 1.67921C4.92435 1.38617 4.40874 1.22977 3.88129 1.22977C3.17466 1.23193 2.49759 1.5136 1.99793 2.01326C1.49827 2.51292 1.2166 3.18999 1.21444 3.89661Z" fill={color} />
                    </svg>

                )
            }
            {
                type === "primary-key" && (
                    <svg width={width || "10"} height={height || "16"} viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.09802 1.06874C1.38924 1.06874 1.66853 1.1811 1.87445 1.38111C2.08037 1.58112 2.19606 1.8524 2.19606 2.13525C2.19606 2.16005 2.19029 2.18351 2.18837 2.20804L3.44178 2.61305L3.90104 1.83103C3.74444 1.68308 3.63683 1.49311 3.59199 1.28544C3.54715 1.07776 3.5671 0.86181 3.64931 0.66521C3.73151 0.46861 3.87223 0.300296 4.05345 0.181797C4.23468 0.0632977 4.44818 0 4.66665 0C4.88511 0 5.09861 0.0632977 5.27984 0.181797C5.46107 0.300296 5.60178 0.46861 5.68399 0.66521C5.76619 0.86181 5.78615 1.07776 5.7413 1.28544C5.69646 1.49311 5.58886 1.68308 5.43225 1.83103L5.89151 2.61305L7.14492 2.20804C7.143 2.18351 7.13723 2.16005 7.13723 2.13525C7.13723 1.92432 7.20163 1.71812 7.32229 1.54273C7.44294 1.36734 7.61443 1.23064 7.81507 1.14992C8.01571 1.0692 8.23649 1.04808 8.44949 1.08923C8.66249 1.13038 8.85814 1.23196 9.0117 1.38111C9.16527 1.53027 9.26985 1.7203 9.31221 1.92719C9.35458 2.13407 9.33284 2.34851 9.24973 2.54339C9.16662 2.73827 9.02588 2.90484 8.84531 3.02203C8.66474 3.13922 8.45244 3.20177 8.23527 3.20177C8.18004 3.20041 8.12499 3.19506 8.07057 3.18578L6.96347 5.69369C7.12793 5.7751 7.25933 5.90797 7.33647 6.07084C7.4136 6.23372 7.43196 6.41709 7.38859 6.59135C7.34521 6.76561 7.24263 6.92058 7.0974 7.03124C6.95218 7.1419 6.77279 7.20178 6.58821 7.20122H5.76469V14.9335C5.76469 15.2163 5.649 15.4876 5.44308 15.6876C5.23715 15.8876 4.95786 16 4.66665 16C4.37543 16 4.09614 15.8876 3.89022 15.6876C3.68429 15.4876 3.56861 15.2163 3.56861 14.9335V14.6669H2.74508C2.52666 14.6669 2.3172 14.5826 2.16276 14.4326C2.00831 14.2826 1.92155 14.0791 1.92155 13.867V13.6003C1.92155 13.3882 2.00831 13.1847 2.16276 13.0347C2.3172 12.8847 2.52666 12.8004 2.74508 12.8004H3.56861V12.2672H2.74508C2.52666 12.2672 2.3172 12.1829 2.16276 12.0329C2.00831 11.8829 1.92155 11.6794 1.92155 11.4673V11.2007C1.92155 10.9885 2.00831 10.7851 2.16276 10.6351C2.3172 10.485 2.52666 10.4008 2.74508 10.4008H3.56861V7.20122H2.74508C2.56045 7.2019 2.38098 7.14211 2.23566 7.03149C2.09034 6.92088 1.98767 6.7659 1.94422 6.59161C1.90077 6.41732 1.91909 6.23389 1.99622 6.07096C2.07334 5.90803 2.20478 5.77512 2.36927 5.69369L1.26273 3.18578C1.20831 3.19506 1.15325 3.20041 1.09802 3.20177C0.806802 3.20177 0.527511 3.08941 0.321589 2.8894C0.115666 2.68939 -1.98226e-05 2.41811 -1.98226e-05 2.13525C-1.98226e-05 1.8524 0.115666 1.58112 0.321589 1.38111C0.527511 1.1811 0.806802 1.06874 1.09802 1.06874ZM4.66665 0.535476C4.55806 0.535476 4.45191 0.566751 4.36163 0.625346C4.27134 0.683941 4.20097 0.767225 4.15942 0.864666C4.11786 0.962106 4.10699 1.06933 4.12818 1.17277C4.14936 1.27621 4.20165 1.37123 4.27843 1.44581C4.35521 1.52038 4.45304 1.57117 4.55954 1.59175C4.66604 1.61232 4.77643 1.60176 4.87675 1.5614C4.97707 1.52104 5.06281 1.45269 5.12314 1.365C5.18347 1.2773 5.21567 1.1742 5.21567 1.06874C5.21567 0.927306 5.15782 0.791669 5.05486 0.691664C4.9519 0.591658 4.81226 0.535476 4.66665 0.535476ZM8.78429 2.13525C8.78429 2.02979 8.75209 1.92669 8.69177 1.83899C8.63144 1.7513 8.54569 1.68295 8.44537 1.64259C8.34505 1.60223 8.23466 1.59167 8.12816 1.61224C8.02167 1.63282 7.92384 1.68361 7.84706 1.75818C7.77028 1.83276 7.71799 1.92778 7.6968 2.03122C7.67562 2.13466 7.68649 2.24188 7.72805 2.33932C7.7696 2.43676 7.83997 2.52005 7.93025 2.57864C8.02054 2.63724 8.12669 2.66851 8.23527 2.66851C8.38088 2.66851 8.52053 2.61233 8.62349 2.51233C8.72645 2.41232 8.78429 2.27668 8.78429 2.13525ZM6.40731 5.60144L6.76033 4.80155H2.57296L2.92598 5.60144H6.40731ZM3.84312 10.934H2.74508C2.67227 10.934 2.60245 10.9621 2.55097 11.0121C2.49949 11.0621 2.47057 11.13 2.47057 11.2007V11.4673C2.47057 11.538 2.49949 11.6058 2.55097 11.6558C2.60245 11.7058 2.67227 11.7339 2.74508 11.7339H3.84312C3.91592 11.7339 3.98574 11.762 4.03723 11.812C4.08871 11.862 4.11763 11.9298 4.11763 12.0006V13.0671C4.11763 13.1378 4.08871 13.2056 4.03723 13.2556C3.98574 13.3056 3.91592 13.3337 3.84312 13.3337H2.74508C2.67227 13.3337 2.60245 13.3618 2.55097 13.4118C2.49949 13.4618 2.47057 13.5296 2.47057 13.6003V13.867C2.47057 13.9377 2.49949 14.0055 2.55097 14.0555C2.60245 14.1055 2.67227 14.1336 2.74508 14.1336H3.84312C3.91592 14.1336 3.98574 14.1617 4.03723 14.2117C4.08871 14.2617 4.11763 14.3295 4.11763 14.4002V14.9335C4.11763 15.0749 4.17547 15.2105 4.27843 15.3106C4.38139 15.4106 4.52104 15.4667 4.66665 15.4667C4.81226 15.4667 4.9519 15.4106 5.05486 15.3106C5.15782 15.2105 5.21567 15.0749 5.21567 14.9335V7.20122H4.11763V10.6674C4.11763 10.7381 4.08871 10.8059 4.03723 10.8559C3.98574 10.9059 3.91592 10.934 3.84312 10.934ZM2.74508 6.66796H6.58821C6.66102 6.66796 6.73084 6.63987 6.78232 6.58987C6.8338 6.53986 6.86272 6.47204 6.86272 6.40133C6.86272 6.33062 6.8338 6.2628 6.78232 6.21279C6.73084 6.16279 6.66102 6.1347 6.58821 6.1347H2.74508C2.67227 6.1347 2.60245 6.16279 2.55097 6.21279C2.49949 6.2628 2.47057 6.33062 2.47057 6.40133C2.47057 6.47204 2.49949 6.53986 2.55097 6.58987C2.60245 6.63987 2.67227 6.66796 2.74508 6.66796ZM2.33743 4.26829H6.99586L7.56657 2.97514C7.46859 2.90266 7.38387 2.81469 7.31594 2.71491L5.85143 3.18817C5.82343 3.1971 5.79416 3.20168 5.76469 3.20177C5.71623 3.20178 5.66863 3.18932 5.62673 3.16567C5.58483 3.14202 5.55012 3.10802 5.52614 3.06712L4.95433 2.09339C4.76651 2.14943 4.56569 2.14943 4.37786 2.09339L3.80688 3.06846C3.78274 3.10907 3.748 3.14278 3.70617 3.16618C3.66434 3.18959 3.61689 3.20187 3.56861 3.20177C3.53922 3.20173 3.51003 3.19714 3.48214 3.18817L2.01735 2.71491C1.94943 2.81485 1.8646 2.90292 1.76645 2.9754L2.33743 4.26829ZM1.09802 2.66851C1.20661 2.66851 1.31275 2.63724 1.40304 2.57864C1.49332 2.52005 1.56369 2.43676 1.60525 2.33932C1.6468 2.24188 1.65767 2.13466 1.63649 2.03122C1.61531 1.92778 1.56302 1.83276 1.48624 1.75818C1.40945 1.68361 1.31163 1.63282 1.20513 1.61224C1.09863 1.59167 0.98824 1.60223 0.887919 1.64259C0.787599 1.68295 0.701853 1.7513 0.641526 1.83899C0.581199 1.92669 0.549 2.02979 0.549 2.13525C0.549 2.27668 0.606843 2.41232 0.709804 2.51233C0.812765 2.61233 0.952411 2.66851 1.09802 2.66851Z" fill={color} />
                    </svg>
                )
            }
            {
                type === "flag" && (
                    <svg width={width || "9"} height={height || "13"} viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.37063 3.75412L8.31849 1.71634C8.4081 1.62259 8.43458 1.48196 8.38651 1.35966C8.33804 1.23736 8.22399 1.15767 8.09731 1.15767H1.03582V0.577273C1.03582 0.396591 0.895695 0.25 0.722987 0.25C0.550278 0.25 0.410156 0.396591 0.410156 0.577273V11.9227C0.410156 12.1034 0.550278 12.25 0.722987 12.25C0.895695 12.25 1.03582 12.1034 1.03582 11.9227V6.35057H8.09731C8.22399 6.35057 8.33804 6.27088 8.38651 6.14858C8.43458 6.02628 8.4081 5.88565 8.31849 5.7919L6.37063 3.75412ZM1.03582 5.69602V1.81222H7.34212L5.70709 3.52273C5.58489 3.65057 5.58489 3.85767 5.70709 3.98551L7.34212 5.69602H1.03582Z" fill={color} />
                    </svg>

                )
            }
            {

                type === "dots" && (
                    <svg width={width || "3"} height={height || "12"} viewBox="0 0 3 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="1.38462" cy="1.38462" r="1.38462" fill={color} />
                        <circle cx="1.38462" cy="6" r="1.38462" fill={color} />
                        <circle cx="1.38462" cy="10.6154" r="1.38462" fill={color} />
                    </svg>
                )
            }

            {
                type === "edit" && (
                    <svg width={width || "13"} height={height || "18"} viewBox="0 0 13 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.46196 14.9637L1 17L1.23443 12.9901L8.48001 1.12952C8.51778 1.06826 8.57824 1.02443 8.6482 1.00758C8.71816 0.990729 8.79195 1.00222 8.85346 1.03956L11.6176 2.72965C11.6788 2.76742 11.7227 2.82788 11.7395 2.89784C11.7564 2.9678 11.7449 3.04159 11.7075 3.1031L4.46196 14.9637Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7.32422 3.01859L10.5517 4.99217" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M1.07635 15.5471L2.25397 16.2667" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )
            }
            {
                type === "null" && (
                    <svg width={width || "22"} height={height || "22"} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10.9097" cy="10.9096" r="5.92857" transform="rotate(45 10.9097 10.9096)" stroke={color} />
                        <path d="M4.54572 17.2736L17.2736 4.54567" stroke={color} strokeLinecap="round" />
                    </svg>
                )
            }
            {
                type === "color-palette" && (
                    <svg width={width || "13"} height={height || "12"} viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.10742 12H6.16817C6.98843 12 7.64159 11.3316 7.64159 10.5266C7.64159 9.72152 6.97324 9.05316 6.16817 9.05316C5.78843 9.05316 5.46944 8.73418 5.46944 8.35443C5.46944 8.21772 5.51501 8.08101 5.59096 7.95949C5.74286 7.73165 6.04666 7.62532 6.35045 7.70127L6.39602 7.71645C6.66944 7.77721 6.89729 7.98987 7.01881 8.27848C7.29223 8.91646 7.91501 9.32658 8.61374 9.32658C10.4669 9.32658 11.9707 7.83797 12.0163 6V5.90886C11.9555 2.64304 9.2821 0 6.00109 0C2.75045 0 0.0618459 2.64304 0.00108643 5.87848C-0.0292933 7.47342 0.578301 8.97721 1.71754 10.1468C2.87197 11.3316 4.4821 12 6.10742 12ZM6.00109 0.607595C8.96311 0.607595 11.3631 3.0076 11.3935 5.95443C11.3783 7.47342 10.1327 8.71899 8.59855 8.71899C8.14286 8.71899 7.74792 8.44557 7.56564 8.03544C7.36817 7.57975 6.98843 7.24557 6.53273 7.12405L6.48716 7.10886C5.94033 6.97215 5.3783 7.16962 5.0745 7.61013C4.92261 7.82278 4.84666 8.08101 4.84666 8.33924C4.84666 9.06835 5.43906 9.64557 6.15299 9.64557C6.63906 9.64557 7.01881 10.0405 7.01881 10.5114C7.01881 10.9823 6.62387 11.3772 6.15299 11.3772H6.09223C4.61881 11.3772 3.17577 10.7696 2.12767 9.70633C1.10995 8.65823 0.563112 7.30633 0.593491 5.87848C0.669441 2.97722 3.08463 0.607595 6.00109 0.607595Z" fill={color} />
                        <path d="M6.30487 3.56961C6.89727 3.56961 7.36816 3.09872 7.36816 2.50631C7.36816 1.91391 6.89727 1.44302 6.30487 1.44302C5.71246 1.44302 5.24158 1.91391 5.24158 2.50631C5.24158 3.09872 5.71246 3.56961 6.30487 3.56961ZM6.30487 2.05062C6.5631 2.05062 6.76056 2.24809 6.76056 2.50631C6.76056 2.76454 6.5631 2.96201 6.30487 2.96201C6.04664 2.96201 5.84917 2.76454 5.84917 2.50631C5.84917 2.24809 6.04664 2.05062 6.30487 2.05062Z" fill={color} />
                        <path d="M3.57072 4.78481C4.23907 4.78481 4.78591 4.23798 4.78591 3.56962C4.78591 2.90127 4.23907 2.35443 3.57072 2.35443C2.90237 2.35443 2.35553 2.90127 2.35553 3.56962C2.35553 4.23798 2.90237 4.78481 3.57072 4.78481ZM3.57072 2.96203C3.9049 2.96203 4.17831 3.23544 4.17831 3.56962C4.17831 3.9038 3.9049 4.17722 3.57072 4.17722C3.23654 4.17722 2.96312 3.9038 2.96312 3.56962C2.96312 3.23544 3.23654 2.96203 3.57072 2.96203Z" fill={color} />
                        <path d="M4.17833 6.6076C4.17833 5.8481 3.57073 5.24051 2.81124 5.24051C2.05175 5.24051 1.44415 5.8481 1.44415 6.6076C1.44415 7.36709 2.05175 7.97469 2.81124 7.97469C3.57073 7.97469 4.17833 7.36709 4.17833 6.6076ZM2.05175 6.6076C2.05175 6.18228 2.38592 5.8481 2.81124 5.8481C3.23656 5.8481 3.57073 6.18228 3.57073 6.6076C3.57073 7.03291 3.23656 7.36709 2.81124 7.36709C2.38592 7.36709 2.05175 7.03291 2.05175 6.6076Z" fill={color} />
                        <path d="M8.58339 4.48102C9.08466 4.48102 9.49478 4.07089 9.49478 3.56963C9.49478 3.06836 9.08466 2.65823 8.58339 2.65823C8.08212 2.65823 7.672 3.06836 7.672 3.56963C7.672 4.07089 8.08212 4.48102 8.58339 4.48102ZM8.58339 3.26583C8.75048 3.26583 8.88719 3.40254 8.88719 3.56963C8.88719 3.73671 8.75048 3.87342 8.58339 3.87342C8.4163 3.87342 8.27959 3.73671 8.27959 3.56963C8.27959 3.40254 8.4163 3.26583 8.58339 3.26583Z" fill={color} />
                    </svg>

                )
            }

            {
                type === "star" && (
                    <svg width={width || "16"} height={height || "15"} viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 1.61803L9.32058 5.68237L9.43284 6.02786H9.79611H14.0696L10.6123 8.53976L10.3184 8.75329L10.4306 9.09878L11.7512 13.1631L8.29389 10.6512L8 10.4377L7.70611 10.6512L4.24877 13.1631L5.56936 9.09878L5.68162 8.75329L5.38772 8.53976L1.93039 6.02786H6.20389H6.56716L6.67942 5.68237L8 1.61803Z" stroke={color} />
                    </svg>

                )
            }

            {
                type === "circle" && (
                    <svg width={width || "9"} height={height || "9"} viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="4.5" cy="4.5" r="4" stroke={color} />
                        <circle cx="4.5" cy="4.5" r="0.5" fill={color} />
                    </svg>

                )
            }

            {
                type === "check" && (
                    <svg width={width || "8"} height={height || "7"} viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.65986 6.59555C2.71333 6.65805 2.77977 6.70816 2.85456 6.74238C2.92936 6.7766 3.01071 6.79411 3.09296 6.79369C3.17702 6.79137 3.2595 6.77034 3.33441 6.73215C3.40933 6.69396 3.47479 6.63956 3.52605 6.5729L7.88248 0.911525C7.92783 0.852606 7.96114 0.785331 7.98049 0.713542C7.99984 0.641752 8.00486 0.566854 7.99527 0.493123C7.98567 0.419393 7.96165 0.348274 7.92457 0.283828C7.88749 0.219381 7.83808 0.162869 7.77916 0.117518C7.72024 0.0721669 7.65297 0.0388645 7.58118 0.0195129C7.50939 0.00016136 7.43449 -0.00486074 7.36076 0.00473341C7.28703 0.0143276 7.21591 0.0383501 7.15146 0.0754293C7.08702 0.112509 7.03051 0.161919 6.98515 0.220838L3.05616 5.31607L1.04071 2.94679C0.996651 2.87905 0.938601 2.82153 0.870463 2.7781C0.802325 2.73466 0.725678 2.70631 0.645674 2.69496C0.565669 2.68361 0.484162 2.68951 0.40663 2.71228C0.329098 2.73505 0.257338 2.77415 0.196173 2.82695C0.135008 2.87976 0.0858562 2.94505 0.0520208 3.01843C0.0181853 3.09181 0.000450676 3.17158 8.47808e-06 3.25238C-0.00043372 3.33319 0.016427 3.41315 0.0494573 3.4869C0.0824876 3.56064 0.130922 3.62647 0.191505 3.67994L2.65986 6.59555Z" fill={color} />
                    </svg>
                )
            }

            {
                type === "dots-grid" && (
                    <svg width={width || "9"} height={height || "20"} viewBox="0 0 9 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.42857 2.85714C2.21755 2.85714 2.85714 2.21755 2.85714 1.42857C2.85714 0.639593 2.21755 0 1.42857 0C0.639593 0 0 0.639593 0 1.42857C0 2.21755 0.639593 2.85714 1.42857 2.85714Z" fill={color} />
                        <path d="M7.14274 2.85714C7.93172 2.85714 8.57132 2.21755 8.57132 1.42857C8.57132 0.639593 7.93172 0 7.14274 0C6.35377 0 5.71417 0.639593 5.71417 1.42857C5.71417 2.21755 6.35377 2.85714 7.14274 2.85714Z" fill={color} />
                        <path d="M1.42857 8.57144C2.21755 8.57144 2.85714 7.93184 2.85714 7.14287C2.85714 6.35389 2.21755 5.71429 1.42857 5.71429C0.639593 5.71429 0 6.35389 0 7.14287C0 7.93184 0.639593 8.57144 1.42857 8.57144Z" fill={color} />
                        <path d="M7.14274 8.57144C7.93172 8.57144 8.57132 7.93184 8.57132 7.14287C8.57132 6.35389 7.93172 5.71429 7.14274 5.71429C6.35377 5.71429 5.71417 6.35389 5.71417 7.14287C5.71417 7.93184 6.35377 8.57144 7.14274 8.57144Z" fill={color} />
                        <path d="M1.42857 14.2857C2.21755 14.2857 2.85714 13.6461 2.85714 12.8571C2.85714 12.0682 2.21755 11.4286 1.42857 11.4286C0.639593 11.4286 0 12.0682 0 12.8571C0 13.6461 0.639593 14.2857 1.42857 14.2857Z" fill={color} />
                        <path d="M7.14274 14.2857C7.93172 14.2857 8.57132 13.6461 8.57132 12.8571C8.57132 12.0682 7.93172 11.4286 7.14274 11.4286C6.35377 11.4286 5.71417 12.0682 5.71417 12.8571C5.71417 13.6461 6.35377 14.2857 7.14274 14.2857Z" fill={color} />
                        <path d="M1.42857 20C2.21755 20 2.85714 19.3604 2.85714 18.5714C2.85714 17.7824 2.21755 17.1428 1.42857 17.1428C0.639593 17.1428 0 17.7824 0 18.5714C0 19.3604 0.639593 20 1.42857 20Z" fill={color} />
                        <path d="M7.14274 20C7.93172 20 8.57132 19.3604 8.57132 18.5714C8.57132 17.7824 7.93172 17.1428 7.14274 17.1428C6.35377 17.1428 5.71417 17.7824 5.71417 18.5714C5.71417 19.3604 6.35377 20 7.14274 20Z" fill={color} />
                    </svg>


                )
            }

            {
                type === "multi-key" && (
                    <svg width={width || "10"} height={height || "17"} viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.14129 3.07629C6.13946 3.80626 5.87764 4.51171 5.40277 5.06612C4.9279 5.62053 4.27105 5.98763 3.55002 6.10159L3.55002 12.1457C3.55002 12.2746 3.49883 12.3982 3.40772 12.4893C3.3166 12.5804 3.19302 12.6316 3.06416 12.6316C2.9353 12.6316 2.81172 12.5804 2.7206 12.4893C2.62949 12.3982 2.5783 12.2746 2.5783 12.1457L2.5783 11.9838L1.12071 11.9838C0.991849 11.9838 0.868268 11.9326 0.777152 11.8415C0.686035 11.7504 0.634845 11.6268 0.634845 11.4979C0.634845 11.3691 0.686035 11.2455 0.777152 11.1544C0.868269 11.0632 0.991849 11.012 1.12071 11.012L2.5783 11.012L2.5783 10.0403L1.76853 10.0403C1.63967 10.0403 1.51609 9.98913 1.42497 9.89802C1.33385 9.8069 1.28266 9.68332 1.28266 9.55446C1.28266 9.4256 1.33385 9.30202 1.42497 9.2109C1.51609 9.11979 1.63967 9.0686 1.76853 9.0686L2.5783 9.0686L2.5783 6.10159C1.99937 6.00755 1.45949 5.74968 1.0225 5.35847C0.585515 4.96726 0.269711 4.45908 0.112441 3.89404C-0.0448298 3.32901 -0.0369867 2.73075 0.135041 2.17003C0.30707 1.60931 0.636085 1.10959 1.08317 0.729966C1.53026 0.350346 2.07672 0.106712 2.65792 0.0278783C3.23911 -0.0509553 3.83072 0.0383107 4.36278 0.285118C4.89484 0.531926 5.34509 0.925949 5.66026 1.42058C5.97544 1.91522 6.14236 2.48977 6.14129 3.07629ZM0.958754 3.07629C0.958754 3.4927 1.08223 3.89976 1.31358 4.24599C1.54492 4.59222 1.87374 4.86208 2.25846 5.02143C2.64317 5.18078 3.0665 5.22248 3.4749 5.14124C3.88331 5.06 4.25846 4.85948 4.55291 4.56503C4.84735 4.27059 5.04787 3.89544 5.12911 3.48703C5.21035 3.07862 5.16865 2.6553 5.0093 2.27058C4.84995 1.88587 4.58009 1.55705 4.23386 1.32571C3.88763 1.09436 3.48057 0.970881 3.06416 0.970881C2.5063 0.97259 1.97177 1.19496 1.5773 1.58943C1.18283 1.9839 0.960463 2.51842 0.958754 3.07629Z" fill={color} />
                        <path d="M8.87027 6.44497L8.87027 6.44507C8.86835 7.21071 8.59373 7.95062 8.09567 8.53211C7.62554 9.08099 6.98535 9.45483 6.279 9.59556L6.279 15.5141C6.279 15.6828 6.21201 15.8445 6.09276 15.9638C5.97351 16.083 5.81178 16.15 5.64314 16.15C5.4745 16.15 5.31276 16.083 5.19352 15.9638C5.07427 15.8445 5.00728 15.6828 5.00728 15.5141L5.00728 15.5022L3.69969 15.5022C3.53105 15.5022 3.36931 15.4352 3.25006 15.3159C3.13082 15.1967 3.06382 15.035 3.06382 14.8663C3.06382 14.6977 3.13082 14.5359 3.25006 14.4167C3.36931 14.2974 3.53105 14.2305 3.69969 14.2305L5.00728 14.2305L5.00728 13.5587L4.3475 13.5587C4.17886 13.5587 4.01713 13.4917 3.89788 13.3725C3.77863 13.2532 3.71164 13.0915 3.71164 12.9229C3.71164 12.7542 3.77863 12.5925 3.89788 12.4732C4.01713 12.354 4.17886 12.287 4.3475 12.287L5.00728 12.287L5.00728 9.59502C4.44785 9.48117 3.92792 9.22044 3.50143 8.83863C3.0431 8.42831 2.71187 7.89531 2.54691 7.30267C2.38196 6.71004 2.39019 6.08255 2.57062 5.49444C2.75105 4.90633 3.09614 4.3822 3.56507 3.98403C4.034 3.58587 4.60715 3.33033 5.21673 3.24765C5.82632 3.16496 6.44683 3.25859 7.00488 3.51745C7.56293 3.77632 8.03517 4.18959 8.36575 4.70839C8.69632 5.22718 8.8714 5.8298 8.87027 6.44497ZM3.68773 6.44499C3.68779 6.83163 3.80247 7.20958 4.01728 7.53106C4.23214 7.85263 4.53753 8.10325 4.89484 8.25125C5.25214 8.39926 5.64531 8.43798 6.02462 8.36253C6.40393 8.28708 6.75235 8.10084 7.02582 7.82738C7.29929 7.55391 7.48552 7.20549 7.56097 6.82618C7.63642 6.44686 7.5977 6.0537 7.4497 5.69639C7.3017 5.33909 7.05107 5.0337 6.7295 4.81883C6.40798 4.604 6.02998 4.48932 5.64329 4.48929C5.12516 4.49096 4.62873 4.69752 4.26235 5.0639C3.89593 5.43032 3.68936 5.92681 3.68773 6.44499Z" fill={color} stroke="white" stroke-width="0.3" />
                    </svg>
                )

            }
        </>
    )
}