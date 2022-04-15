
using salmpledv2_backend.Models.DTOS;
using salmpledv2_backend.Models.ServiceResponse;

namespace salmpledv2_backend.Services {
    public interface IUserService {
        Task<ServiceResponse<string>> PostRegisterUser(PostRegisterUserDTO User);

        Task<ServiceResponse<List<GetUserDTO>>> UserSearch(KeywordDTO keywordDTO);

        Task<ServiceResponse<string>> AddCollab(AddCollabDTO addCollabDTO);
        

    }
}