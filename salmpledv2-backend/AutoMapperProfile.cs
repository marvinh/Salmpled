using AutoMapper;
using salmpledv2_backend.Models;
using salmpledv2_backend.Models.DTOS;
using System.Linq;
using salmpledv2_backend.Services;
namespace salmpledv2_backendv2_backend
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // CreateMap<Sample, GetSampleDTO>()
            // .ForMember(sampmodel => sampmodel.FileName, sampto => sampto.MapFrom(sampto => sampto.RenamedFileName))
            // .ForMember(sampmodal => sampmodal.Username, sampto => sampto.MapFrom(sampto => sampto.User.Username))
            // .ForMember(sampmodel => sampmodel.SignedMP3URL, 
            // sampto => sampto.MapFrom(sampto => 
            // sampto.CompressedSampleKey != null ? MyS3Service.GeneratePreSignedURL(sampto.CompressedSampleKey) : ""))
            // ;

            // CreateMap<SamplePlaylist, GetSamplePlaylistDTO>()
            // .ForMember(dto => dto.Samples,
            // opt => opt.MapFrom(x => x.SampleSamplePlaylists.Select(y => y.Sample).ToList()))
            // .ForMember(dto => dto.Username, opt => opt.MapFrom(x => x.User.Username));

            // CreateMap<User, GetUserDTO>()
            // .ForMember(usermodel => usermodel.SignedUserImage, 
            // userto => userto.MapFrom(userto => userto.UserImageKey != null ? MyS3Service.GeneratePreSignedURL(userto.UserImageKey) : ""));

            CreateMap<Pack, GetPackDTO>()
            .ForMember(dto => dto.User , s => s.MapFrom(s => s.User))
            .ForMember(dto => dto.Collaborators, s => s.MapFrom(s => s.Group.UserGroups.Select(s => s.User).ToList()))
            .ForMember(dto => dto.Genres,s => s.MapFrom(s => s.PackGenres.Select(s => s.Genre).ToList()));
            
            CreateMap<Sample,GetSampleDTO>()
            .ForMember(dto => dto.Tags, s => s.MapFrom(s => s.SampleTags.Select(s => s.Tag).ToList()));

            CreateMap<User, GetUserDTO>();

            CreateMap<Genre, GetGenreDTO>(); 

            CreateMap<Tag, GetTagDTO>();

            CreateMap<SampleTag, GetSampleTagDTO>();

            CreateMap<UserGroup, GetUserGroupDTO>();
        }        
    }
}